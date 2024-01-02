// Modules for express, extensions and logging
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const logger = require('morgan');
const sessions = require('express-session');
const MySQLStore = require('express-mysql-session')(sessions);
const rfs = require('rotating-file-stream');
const bodyParser = require('body-parser');

// Modules for loading routes
const fsp = require('fs').promises;
const path = require('path');

const signUpController = require('../../src/controllers/signUpController');
const signInController = require('../../src/controllers/signInController');
const emailVerificationController = require('../../src/controllers/emailVerificationController');
const forgotPasswordController = require('../../src/controllers/forgotPasswordController');


// Custom modules
const { makeConnection, executeMysqlQuery } = require('../utilities/mysqlHelper');
const Router = require('./Router');
const Logger = require('../utilities/consoleLog');
const { decrypt } = require('../utilities/aes');
const { error } = require('console');

// Setup Config
require('dotenv').config();

// Start MySQL connection
makeConnection();

let accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    size: '20M', // rotate when file size exceeds 20 MegaBytes
    compress: "gzip", // compress rotated files
    path: path.join(__dirname, '../..', 'logs/access')
});

class App {
    io;
    server;
    constructor() {
        // Create the app and the server
        this.app = express();
        this.server = require('http').createServer(this.app);
        // Create ejs and use it as a render engine
        this.app.engine('e', require('ejs').renderFile);
        this.app.set('view engine', 'ejs');
        // Set the views directory
        this.app.set('views', path.join(__dirname, '..', 'views'));
        // Setup cors, sessions, cookies, logger, json and urlencoded
        this.app.use(cors());
        const sessionStore = new MySQLStore({
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.MYSQL_USERNAME,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            clearExpired: true, // Automatically remove expired sessions
            checkExpirationInterval: 900000, // How often expired sessions will be cleared (in milliseconds)
            expiration: 86400000, // The maximum age of a session (in milliseconds) - 24 hours
        });
        this.app.use(sessions({
            // This is a secret key, it is used to encrypt the session cookie
            secret: "collarcode-rsa_key-Ewvv83w3AEGJYkSTXsCV3KqFbHExunCNTS3dLzZ7gpfoxyq93wjznmNzGZYwRCPFgVrfenTKTAEULZx9JvgociZHUEdZB28o2waD6FoB2BbbKPAcvxjVg9KZTcoD2VJd",
            saveUninitialized: true,
            store: sessionStore,
            cookie: { maxAge: 1000 * 60 * 60 * 24 },
            resave: false
        }));
        this.app.use(cookieParser());
        this.app.use(logger('[:date[iso]] :remote-addr ":referrer" ":user-agent" :method :url :status :res[content-length] - :response-time ms', { stream: accessLogStream }));
        this.app.use(logger(' >> :method :url :status :res[content-length] - :response-time ms'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({
            extended: true
        }));
        // Register assets as a route from the public folder
        this.app.use('/public', express.static(path.join(__dirname, '..', 'public')));
        // setup body parser
        this.app.use(bodyParser.json({ limit: '50mb' }));
    }

    // This function recurses all dierctories in the routes folder and
    // registers them as routes with endpoints in those files.
    async registerRoutes() {
        const recursiveRegisterRoutes = async (directory) => {
            const files = await fsp.readdir(directory);

            for await (const file of files) {
                const filePath = path.join(directory, file);
                const stat = await fsp.stat(filePath);

                if (stat.isDirectory()) {
                    await recursiveRegisterRoutes(filePath);
                } else if (file.endsWith('.js')) {
                    const router = require(filePath);
                    if (router.prototype instanceof Router) {
                        const instance = new router(this);
                        const pathUpToRoutes = filePath.split(path.sep).slice(-2).join(path.sep);
                        Logger.route(`Serving new route: ${instance.path} (from ${pathUpToRoutes})`);
                        if (instance.auth) {
                            this.app.use(instance.path, this.Authentication, instance.createRoute());
                        } else {
                            this.app.use(instance.path, instance.createRoute());
                        }
                    }
                }
            }
        };

        const filePath = path.join(__dirname, '..', 'routes');
        await recursiveRegisterRoutes(filePath);

        /**
         * DO NOT USE THIS FILE TO ADD NEW ROUTES WITH MORE THAN ONE SLASH.
         * THIS IS A BASE FILE USED ONLY FOR ROUTES WITH ONE SLASH LIKE /signup OR /profile
         * CREATE A ROUTE USING 'Router.js' AS THE MAIN CLASS
         */

        this.app.get('/', (req, res) => {
            return res.render('static/landing');
        });

        this.app.get('/signup', (req, res) => {
            return res.render('user management/signUp');
        });

        this.app.post('/signup', signUpController.handleSignup);

        this.app.get('/signin', signInController.renderSignin);

        this.app.post('/signin', signInController.handleSignin);

        this.app.get('/verify', (req, res) => {
            return res.render('user management/verifyEmail');
        });

        this.app.get('/verify/:userId/:uniqueString', async (req, res) => {
            const { userId, uniqueString } = req.params;

            try {
                const verificationResult = await emailVerificationController.checkVerification({ userId, uniqueString });

                if (verificationResult.status === "SUCCESS") {
                    // verification success
                    return res.redirect('/dashboard');
                } else {
                    // verification failed
                    console.error("failed")
                    return res.render('user management/verifyEmail', { error: verificationResult.message });
                }
            } catch (error) {
                console.error(error);
                return res.render('errorPage'); // prob best to not just 404 them aye
            }
        });

        this.app.get('/forgot-password', (req, res) => {
            return res.render('user management/forgotPasswordForm');
        });

        this.app.post('/forgot-password', forgotPasswordController.sendPasswordResetEmail);

        this.app.get('/forgot-password/:_id/:token', async (req, res) => {
            const { _id, token } = req.params;

            try {
                const forgotPasswordResult = await forgotPasswordController.checkResetToken({ _id, token });

                if (forgotPasswordResult.status === "SUCCESS") {
                    // verification success
                    console.log(_id, token)
                    return res.render('user management/resetPasswordForm', { _id, token });
                } else {
                    // verification failed
                    console.log(forgotPasswordResult.errors);
                    return res.render('user management/forgotPasswordForm', { error: forgotPasswordResult.error });
                }
            } catch (error) {
                console.error(error);
                return res.render('errorPage'); // prob best to not just 404 them aye
            }
        });

        this.app.post('/reset-password/:_id/:token', forgotPasswordController.resetPassword);

        this.app.get('/dashboard', (req, res) => {
            if (req.session.user) {
                return res.render('static/dashboard');
            } else {
                return res.redirect('/signin')
                // would be good to tell the user their session expired at some point
            }
        });

        this.app.get('/logout', (req, res) => {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session when logging out:', err)
                }

                res.redirect('/signin');
            });
        });

        // If no page is found, render 404
        this.app.use((req, res) => {
            return res.status(404).render('static/404');
        });
    }

    // Listen on the environment's port and IP for requests
    // This now serves as the main entry point for the application
    async listen(fn) {
        this.server.listen(process.env.EXPRESS_PORT, process.env.EXPRESS_IP, fn)
    }
}

module.exports = App;