const { connect } = require('mongoose');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function checkUserExists(connection, email) {
    try {
        const [rows, fields] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows.length > 0;
    } catch (error) {
        console.error('Error checking user existence:', error);
        throw error;
    }
}

const checkVerified = async (connection, email) => {
    try {
        const [rows] = await connection.query(
            'SELECT verified FROM users WHERE email = ?',
            [email]
        );
        if (rows.length > 0) {
            const isVerified = rows[0].verified === 1;
            return isVerified;
        } else {
            // not verified
            return false;
        }
    } catch (error) {
        console.error('Error checking if user is verified:', error)
    }
};

const getUserData = async (connection, email) => {
    try {
        const [rows] = await connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};

const getUserId = async (connection, email) => {
    try {
        const [rows] = await connection.query(
            'SELECT user_id from users where email = ?',
            [email]
        );

        return rows.length > 0 ? rows[0] : 0;
    } catch (error) {
        console.error('Error fetching userId:', error)
        throw error;
    }
}

const getHashedPassword = async (connection, email) => {
    try {
        const userData = await getUserData(connection, email);
        return userData ? userData.password : null;
    } catch (error) {
        console.error('Error fetching password from user data:', error);
        throw error;
    }
};

const getVerificationData = async (connection, userId) => {
    try {
        const [rows] = await connection.query(
            'SELECT * FROM user_verification WHERE user_id = ?',
            [userId]
        );

        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error fetching verification data:', error);
        throw error;
    }
};

const getResetTokenData = async (connection, _id) => {
    try {
        const [rows] = await connection.query(
            'SELECT * FROM password_reset WHERE user_id = ?',
            [_id]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error fetching reset token data:', error);
        throw error;
    }
};

const hashString = async (string) => {
    const saltRounds = 10;
    return await bcrypt.hash(string, saltRounds);
};

module.exports = {
    checkUserExists,
    checkVerified,
    getUserData,
    getUserId,
    getHashedPassword,
    getVerificationData,
    getResetTokenData,
    hashString,
};