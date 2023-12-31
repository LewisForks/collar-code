const bcrypt = require('bcrypt');
const { validateSignupInput } = require('./validationController');
const { sendVerificationEmail } = require('./emailVerificationController');
const path = require('path');
const mysql = require('mysql2/promise');
const dbHelper = require('../src/utilities/dbHelper')

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

async function saveUser(connection, name, email, password, dateOfBirth) {
    try {
        const [result] = await connection.query(
            'INSERT INTO users (name, email, password, dateOfBirth) VALUES (?, ?, ?, ?)',
            [name, email, password, dateOfBirth]
        );

        return result.insertId; 
    } catch (error) {
        console.error('Error saving user to database:', error);
        throw error;
    }
}


const handleSignup = async (req, res) => {
    let connection;

    try {
        let { name, email, password, dateOfBirth } = req.body;
        name = name.trim();
        email = email.trim();
        password = password.trim();
        dateOfBirth = dateOfBirth.trim();

        connection = await pool.getConnection();

        const userExists = await dbHelper.checkUserExists(connection, email);
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

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        userId = await saveUser(connection, name, email, hashedPassword, dateOfBirth);

        const emailResponse = await sendVerificationEmail({ _id: userId, email });


        res.json(emailResponse);
    } catch (err) {
        console.error(err);
        res.json({
            status: 'FAILED',
            message: 'An error occurred during signup.',
            error: err.message,
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    handleSignup,
};
