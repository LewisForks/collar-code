const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');
const dbHelper = require('../../utilities/data/User')
const { validateResetPasswordInput } = require('./Validation.controller');
const { decrypt } = require('../../utilities/aes');

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

const saveResetTokenData = async (connection, userId, hashedToken, expirationTime) => {
    await connection.query(
        'INSERT INTO password_reset (user_id, token, created_at, expires_at) VALUES (?, ?, ?, ?)',
        [userId, hashedToken, new Date(), new Date(Date.now() + expirationTime)]
    );
};

const sendPasswordResetEmail = async (req, res) => {
    let email = req.body.email;
    console.log(email);
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const currentUrl = process.env.APP_URL || "http://localhost:3000/";
        const expirationTime = 6 * 60 * 60 * 1000; // 6 hr

        const { user_id: _id } = await dbHelper.getUserId(connection, email)

        const token = uuidv4() + _id;

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Reset Your Password",
            html: `<p>Click <a href="${currentUrl}forgot-password/${_id}/${token}">here</a> to reset your password. This link <b>expires in 6 hours</b>.</p>`,
        };

        const hashedToken = await dbHelper.hashString(token);

        await saveResetTokenData(connection, _id, hashedToken, expirationTime);

        await transporter.sendMail(mailOptions);

        await connection.commit();

        // generic success, dont tell user if it worked or not
        res.json({
            status: "PENDING",
            message: "Password Reset Email Sent"
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error during sendPasswordResetEmail:", error);

        let errorMessage = "An error occurred during password reset email.";

        if (error.message.includes("hashing")) {
            errorMessage = "Failed to hash password reset data!";
        } else if (error.message.includes("sending")) {
            errorMessage = "Error sending password reset email.";
        }

        res.json({
            status: "FAILED",
            errors: errorMessage
        });
    } finally {
        connection.release();
    }
};

const checkResetToken = async ({ _id, token }) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await dbHelper.getResetTokenData(connection, _id);
        console.log('result from here:', result);
        if (result) {
            const { expires_at, token: storedToken } = result;

            if (expires_at < Date.now()) {

                try {
                    const deleteResult = await connection.execute('DELETE FROM password_reset WHERE user_id = ?', [_id]);

                    if (deleteResult && deleteResult[0] && deleteResult[0].affectedRows !== undefined) {
                        console.log(`Deleted ${deleteResult[0].affectedRows} row(s)`);
                    } else {
                        console.error('Error deleting password reset:', deleteResult);
                    }

                    await connection.commit();

                    return {
                        status: "FAILED",
                        errors: "Password reset link has expired. Please request a new one."
                    };
                } catch (error) {
                    console.error('Error in DELETE operation:', error);
                    await connection.rollback();
                    return {
                        status: "FAILED",
                        error: "An error has occured. Try again."
                    };
                }
            } else {
                const decryptedToken = decrypt(storedToken);
                console.log(decryptedToken === token);

                if (match) {
                    return {
                        status: "SUCCESS",
                        message: "Valid Password Reset Token."
                    };
                } else {
                    return {
                        status: "FAILED",
                        error: "Invalid Password Reset Token, check your inbox."
                    };
                }
            }
        } else {
            return {
                status: "FAILED",
                error: "No password reset record found, please check your inbox."
            };
        }
    } catch (error) {
        console.error(error);
        return {
            status: "FAILED",
            error: "An error has occured. Try again."
        };
    } finally {
        connection.release();
    }
};

const resetPassword = async (req, res) => {
    let password = req.body.password;
    let _id = req.params._id
    let token = req.params.token
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        tokenResult = await checkResetToken({ _id, token });

        if (tokenResult.status === "SUCCESS") {
            const validationError = validateResetPasswordInput(password)
            if (validationError) {
                return res.status(400).json(validationError);
            }

            const hashedPassword = await dbHelper.hashString(password);

            const saveNewPassword = await dbHelper.changePassword(connection, _id, hashedPassword);

            if (saveNewPassword) {
                res.json({
                    status: "SUCCESS",
                });
                await connection.execute('DELETE FROM password_reset WHERE user_id = ?', [_id]);
                connection.commit();
            } else {
                res.json({
                    status: "FAILED",
                    errors: {
                        other: 'Failed to save new password, please try again.'
                    }
                });

                await connection.rollback();
            }
        }

    } catch (error) {
        console.error(error);
        return {
            status: "FAILED",
            error: "An error has occured. Try again."
        };
    } finally {
        connection.release();
    }
}

module.exports = {
    sendPasswordResetEmail,
    checkResetToken,
    resetPassword,
};
