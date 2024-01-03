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

// Custom modules
const { makeConnection } = require('../utilities/mysqlHelper');
const Router = require('./Router');
const Logger = require('../utilities/consoleLog');

// Setup Config
require('dotenv').config();

// Start MySQL connection
makeConnection();

// Create a rotating file stream for logging
let accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    size: '20M', // rotate when file size exceeds 20 MegaBytes
    compress: "gzip", // compress rotated files
    path: path.join(__dirname, '../..', 'logs/access')
});

// Create the app class
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

        const sqlStoreOptions = {
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.MYSQL_USERNAME,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            clearExpired: true, // Automatically remove expired sessions
            checkExpirationInterval: 900000, // How often expired sessions will be cleared (in milliseconds)
            expiration: 86400000, // The maximum age of a session (in milliseconds) - 24 hours
            charset: 'utf8mb4_0900_ai_ci', // SQL charset
        }

        const sqlStore = new MySQLStore(sqlStoreOptions);

        this.app.use(sessions({
            secret: "collarcode-rsa_key-Ewvv83w3AEGJYkSTXsCV3KqFbHExunCNTS3dLzZ7gpfoxyq93wjznmNzGZYwRCPFgVrfenTKTAEULZx9JvgociZHUEdZB28o2waD6FoB2BbbKPAcvxjVg9KZTcoD2VJd",
            saveUninitialized: false, // Don't save a session until something is stored in the cookie
            resave: false, // Don't save a session if it wasn't modified
            store: sqlStore,
            cookie: { maxAge: 1000 * 60 * 60 * 24 },
        }));

        sqlStore.onReady().then(() => {
            Logger.mysql('MySQL session store ready for use.');
        }).catch(error => {
            Logger.error(`MySQL session store failed to load. ${error}`);
        });

        this.app.use(cookieParser());
        this.app.use(logger('[:date[iso]] :remote-addr ":referrer" ":user-agent" :method :url :status :res[content-length] - :response-time ms', { stream: accessLogStream }));
        this.app.use(logger(' >> :method :url :status :res[content-length] - :response-time ms'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({
            extended: true
        }));

        // Register assets as a route from the public folder
        this.app.use('/public', express.static(path.join(__dirname, '..', 'public')));
        // Setup body parser
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

                        // if ${pathUptoRoutes} contains the word 'api'
                        if (pathUpToRoutes.includes('api')) {
                            Logger.API(`Serving new route: ${instance.path} (from ${pathUpToRoutes})`);
                        } else {
                            Logger.route(`Serving new route: ${instance.path} (from ${pathUpToRoutes})`);
                        }

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