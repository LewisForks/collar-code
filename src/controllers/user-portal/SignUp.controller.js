const { validateSignupInput } = require('./Validation.controller');
const { sendVerificationEmail } = require('./EmailVerification.controller');
const path = require('path');
const mysql = require('mysql2/promise');
const dbHelper = require('../../utilities/data/User');
const { executeMysqlQuery } = require('../../utilities/mysqlHelper');

require('dotenv').config();

async function saveUser(name, email, password, dateOfBirth) {
    try {
        const result = await executeMysqlQuery(
            'INSERT INTO users (name, email, password, dateOfBirth, verified) VALUES (?, ?, ?, ?, ?)',
            [name, email, password, dateOfBirth, 0]
        );

        return result.insertId;
    } catch (error) {
        console.error('Error saving user to database:', error);
        throw error;
    }
}


const handleSignup = async (req, res) => {

    try {
        let { name, email, password, dateOfBirth } = req.body;
        name = name.trim();
        email = email.trim();
        password = password.trim();
        dateOfBirth = dateOfBirth.trim();

        const userExists = await dbHelper.checkUserExists(email);
        if (userExists) {
            return res.json({
                status: 'FAILED',
                errors: {
                    email: "An account with this email already exists. <a href='/signin'>Sign in here</a> instead."
                }
            });
        }

        const validationError = validateSignupInput(name, email, password, dateOfBirth);
        if (validationError) {
            return res.status(400).json(validationError);
        }

        const hashedPassword = await dbHelper.hashString(password);

        userId = await saveUser(name, email, hashedPassword, dateOfBirth);

        const emailResponse = await sendVerificationEmail({ _id: userId, email, userName: name });


        res.json(emailResponse);
    } catch (err) {
        console.error(err);
        res.json({
            status: 'FAILED',
            message: 'An error occurred during signup.',
            error: err.message,
        });
    }
};

module.exports = {
    handleSignup,
};
