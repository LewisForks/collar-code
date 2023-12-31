const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const dbHelper = require('../src/utilities/dbHelper');

require('dotenv').config();

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log('Ready for emails');
    }
});

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

function clearErrorMessages() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach((element) => {
        element.textContent = '';
    });
}

// Helper function to display error messages
function displayError(field, message) {
    const errorElement = document.getElementById(`${field}Error`);

    if (errorElement) {
        if (message && /<[a-z][\s\S]*>/i.test(message)) {
            errorElement.innerHTML = message;
        } else {

            errorElement.textContent = message || '';
        }
    }
}
};