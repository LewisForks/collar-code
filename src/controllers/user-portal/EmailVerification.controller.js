const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise')
const dbHelper = require('../../utilities/data/User');
const { executeMysqlQuery } = require('../../utilities/mysqlHelper');
const { decrypt } = require('../../utilities/aes');
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');

require('dotenv').config();

const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
});

const sentFrom = new Sender(process.env.MAILERSEND_EMAIL, process.env.MAILERSEND_NAME)

const saveVerificationData = async (userId, hashedUniqueString, expirationTime) => {
    await executeMysqlQuery(
        'INSERT INTO user_verification (user_id, unique_string, created_at, expires_at) VALUES (?, ?, ?, ?)',
        [userId, hashedUniqueString, new Date(), new Date(Date.now() + expirationTime)]
    );
};

const sendVerificationEmail = async ({ _id, email, userName }) => {

    try {

        const currentUrl = process.env.APP_URL || "http://127.0.0.1:3000/";
        const expirationTime = 6 * 60 * 60 * 1000; // 6 hr

        const uniqueString = uuidv4() + _id;

        const recipient = [
            new Recipient(email, userName)
          ];

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipient)
            .setReplyTo(sentFrom)
            .setSubject("CollarCode | Verify Your Email Address")
            .setHtml(`<p>Verify your email address to complete the signup and login to your new account.</p><p>This link <b>expires in 6 hours</b>.</p><p>Click <a href="${currentUrl}/account/verify/${_id}/${uniqueString}">here</a> to proceed.</p>`)

        const hashedUniqueString = await dbHelper.hashString(uniqueString);

        await saveVerificationData(_id, hashedUniqueString, expirationTime);

        await mailerSend.email.send(emailParams);

        // await transporter.sendMail(mailOptions);

        const response = {
            status: "PENDING",
            message: "Verification Email Sent"
        };

        return response;
    } catch (error) {
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
    }
};

const checkVerification = async ({ userId, uniqueString }) => {
    try {
        const result = await dbHelper.getVerificationData(userId);
        const email = await dbHelper.getUserEmail(userId);
        if (result) {

            const { expires_at, unique_string } = result;

            if (expires_at < Date.now()) {
                await executeMysqlQuery('DELETE FROM user_verification WHERE user_id = ?', [userId]);
                await executeMysqlQuery('DELETE FROM users WHERE user_id = ?', [userId]);

                return {
                    status: "FAILED",
                    message: "Link has expired. Please sign up again."
                };
            } else {
                console.log('1:', uniqueString, '2:', unique_string)
                const decryptedString = decrypt(unique_string);
                if (decryptedString === uniqueString) {
                    await executeMysqlQuery('UPDATE users SET verified = 1 WHERE user_id = ?', [userId]);
                    await executeMysqlQuery('DELETE FROM user_verification WHERE user_id = ?', [userId]);

                    return {
                        status: "SUCCESS",
                        message: "Verification Successful."
                    };

                } else {
                    return {
                        status: "FAILED",
                        message: "Invalid verification details passed, please check your inbox."
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
    }
};

module.exports = {
    sendVerificationEmail,
    checkVerification,
};