const bcrypt = require('bcrypt');
const { validateSignupInput } = require('./validationController');
const { sendVerificationEmail } = require('./emailVerificationController');
const path = require('path');
const mysql = require('mysql2/promise');

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

// Function to check if a user exists in MySQL
async function checkUserExists(connection, email) {
    const [rows, fields] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows.length > 0;
}


// Function to save a new user to MySQL
async function saveUser(connection, name, email, password, dateOfBirth) {
    try {
        const [result] = await connection.query(
            'INSERT INTO users (name, email, password, dateOfBirth) VALUES (?, ?, ?, ?)',
            [name, email, password, dateOfBirth]
        );

        return result.insertId; // Return the inserted id
    } catch (error) {
        console.error('Error saving user to database:', error);
        throw error;
    }
}


const handleSignup = async (req, res) => {
    let connection; // Declare the connection variable outside the try-catch block

    try {
        let { name, email, password, dateOfBirth } = req.body;
        name = name.trim();
        email = email.trim();
        password = password.trim();
        dateOfBirth = dateOfBirth.trim();

        // Validate input
        const validationError = validateSignupInput(name, email, password, dateOfBirth);
        if (validationError) {
            return res.json(validationError);
        }

        // Create a connection from the pool
        connection = await pool.getConnection();

        // Check if user already exists
        const userExists = await checkUserExists(connection, email);
        if (userExists) {
            return res.json({
                status: 'FAILED',
                message: 'A user with that email already exists.',
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create and save new user to MySQL
        userId = await saveUser(connection, name, email, hashedPassword, dateOfBirth);

        // Send verification email
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
            // Release the connection back to the pool
            connection.release();
        }
    }
};

module.exports = {
    handleSignup,
};
