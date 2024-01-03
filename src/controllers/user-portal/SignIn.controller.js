const bcrypt = require('bcrypt');
const { validateSignupInput } = require('./Validation.controller');
const { sendVerificationEmail } = require('./EmailVerification.controller');
const mysql = require('mysql2/promise');
const dbHelper = require('../../utilities/data/User')

require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const renderSignin = (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard')
    }

    res.render('user management/signIn')
}

const handleSignin = async (req, res) => {
    let connection;

    try {
        let { email, password } = req.body;
        email = email.trim();
        password = password.trim();

        if (email === "" || password === "") {
            return res.json({
                status: "FAILED",
                errors: {
                    other: 'Your email or password cannot be blank.'
                }
            });
        }

        connection = await pool.getConnection();

        const userExists = await dbHelper.checkUserExists(connection, email);

        if (userExists) {
            const checkVerified = await dbHelper.checkVerified(connection, email);
            if (!checkVerified) {
                return res.json({
                    status: "FAILED",
                    errors: {
                        email: 'Your email is not verified, please check your inbox.'
                    }
                });
            }

            const hashedPassword = await dbHelper.getHashedPassword(connection, email);
            const match = await bcrypt.compare(password, hashedPassword);

            if (match) {
                req.session.user = {
                    email: email,
                };
                return res.json({
                    status: "SUCCESS",
                    message: "Login Successful",
                    user: req.session.user,
                });
            } else {
                return res.json({
                    status: "FAILED",
                    errors: {
                        password: 'Incorrect Password'
                    }
                });
            }
        } else {
            return res.json({
                status: "FAILED",
                errors: {
                    other: "Email is not assosiated with an account. <a href='/signup'>Sign up here</a> instead."
                }
            })
        }
    } catch (error) {
        console.error('Error during login:', error);
        return res.json({
            status: "FAILED",
            errors: {
                other: 'An error occured during login, please try again.'
            }
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};


module.exports = {
    renderSignin,
    handleSignin,
}