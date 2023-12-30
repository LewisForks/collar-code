const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise')

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
        console.log(success);
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

const hashString = async (string) => {
    const saltRounds = 10;
    return await bcrypt.hash(string, saltRounds);
};

const saveVerificationData = async (connection, userId, hashedUniqueString, expirationTime) => {
    await connection.query(
        'INSERT INTO user_verification (user_id, unique_string, created_at, expires_at) VALUES (?, ?, ?, ?)',
        [userId, hashedUniqueString, new Date(), new Date(Date.now() + expirationTime)]
    );
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

const sendVerificationEmail = async ({ _id, email }) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const currentUrl = process.env.APP_URL || "http://localhost:5000/";
        const expirationTime = 6 * 60 * 60 * 1000; // 6 hr

        const uniqueString = uuidv4() + _id;

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify Your Email",
            html: `<p>Verify your email address to complete the signup and login to your new account.</p><p>This link <b>expires in 6 hours</b>.</p><p>Click <a href="${currentUrl}verify/${_id}/${uniqueString}">here</a> to proceed.</p>`,
        };

        const hashedUniqueString = await hashString(uniqueString);

        await saveVerificationData(connection, _id, hashedUniqueString, expirationTime);

        await transporter.sendMail(mailOptions);

        await connection.commit();

        const response = {
            status: "PENDING",
            message: "Verification Email Sent"
        };

        return response;
    } catch (error) {
        await connection.rollback();
        console.error("Error during sendVerificationEmail:", error);

        let errorMessage = "An error occurred during email verification.";

        if (error.message.includes("hashing")) {
            errorMessage = "Failed to hash email data!";
        } else if (error.message.includes("sending")) {
            errorMessage = "Error sending verification email.";
        }

        const response = {
            status: "FAILED",
            message: errorMessage,
        };

        throw response;
    } finally {
        connection.release();
    }
};

const checkVerification = async ({ userId, uniqueString }) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await getVerificationData(connection, userId);

        if (result) {

            const { expires_at, unique_string } = result;

            if (expires_at < Date.now()) {
                await connection.execute('DELETE FROM user_verification WHERE user_id = ?', [userId]);
                await connection.execute('DELETE FROM users WHERE user_id = ?', [userId]);
                
                return {
                    status: "FAILED",
                    message: "Link has expired. Please sign up again."
                };
            } else {
                const match = await bcrypt.compare(uniqueString, unique_string);
                console.log(match);

                if (match) {
                    await connection.execute('UPDATE users SET verified = 1 WHERE user_id = ?', [userId]);
                    await connection.execute('DELETE FROM user_verification WHERE user_id = ?', [userId]);

                    return {
                        status: "SUCCESS",
                        message: "Verification Successful.",
                    };
                } else {
                    return {
                        status: "FAILED",
                        message: "Invalid vereification details passed, please check your inbox."
                    };
                }
            }
        } else {
            return {
                status: "FAILED",
                message: "Account record doesn't exist or has been verified already. Please sign up or login."
            };
        }
    } catch (error) {
        console.error(error)
        return {
            status: "FAILED",
            message: "An error occured. Check console or try again."
        };
    } finally {
        connection.release();
    }
};

module.exports = {
    sendVerificationEmail,
    checkVerification,
};