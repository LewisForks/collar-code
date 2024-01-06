const { validateSignupInput } = require('./Validation.controller');
const { sendVerificationEmail } = require('./EmailVerification.controller');
const mysql = require('mysql2/promise');
const dbHelper = require('../../utilities/data/User')
const mysqlHelper = require('../../utilities/mysqlHelper');
const { decrypt } = require('../../utilities/aes');

require('dotenv').config();

const renderSignin = (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard')
    }

    res.render('user management/signIn')
}

const handleSignin = async (req, res) => {

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

        const userExists = await dbHelper.checkUserExists(email);
        if (userExists) {
            
            const checkVerified = await dbHelper.checkVerified(email);
            if (!checkVerified) {
                return res.json({
                    status: "FAILED",
                    errors: {
                        email: 'Your email is not verified, please check your inbox.'
                    }
                });
            }

            const hashedPassword = await dbHelper.getHashedPassword(email);
            const decryptedPassword = decrypt(hashedPassword);

            if (decryptedPassword === password) {
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
    }
};


module.exports = {
    renderSignin,
    handleSignin,
}