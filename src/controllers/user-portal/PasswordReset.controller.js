const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2/promise');
const dbHelper = require('../../utilities/data/User')
const { validateResetPasswordInput } = require('./Validation.controller');
const { decrypt } = require('../../utilities/aes');
const { executeMysqlQuery } = require('../../utilities/mysqlHelper');
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');

require('dotenv').config();

const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
});

const sentFrom = new Sender(process.env.MAILERSEND_EMAIL, process.env.MAILERSEND_NAME)

const saveResetTokenData = async (userId, hashedToken, expirationTime) => {
    await executeMysqlQuery(
        'INSERT INTO password_reset (user_id, token, created_at, expires_at) VALUES (?, ?, ?, ?)',
        [userId, hashedToken, new Date(), new Date(Date.now() + expirationTime)]
    );
};

const sendPasswordResetEmail = async (req, res) => {
    let email = req.body.email;
    console.log(email);

    try {
        const { user_id: _id } = await dbHelper.getUserId(email);
        const resetTokenData = await dbHelper.getResetTokenData(_id);
        if (resetTokenData) {
            const resetTokenCreatedAt = new Date(resetTokenData.created_at).getTime();
            const currentTime = new Date().getTime();
            const timeDifferenceInSeconds = (currentTime - resetTokenCreatedAt) / 1000;

            if (timeDifferenceInSeconds >= 60) {
                // been more than 60 seconds - delete old token to create new
                console.log('more than 60 seconds');
                const deleteResult = await executeMysqlQuery('DELETE FROM password_reset WHERE user_id = ?', [_id]);

                if (deleteResult && deleteResult[0] && deleteResult[0].affectedRows !== undefined) {
                    console.log(`Deleted ${deleteResult[0].affectedRows} row(s)`);
                } else {
                    console.error('Error deleting old password reset token:', deleteResult);
                }
            } else {
                console.log('not been more than 60 seconds');

                return res.status(400).json({
                    status: "FAILED",
                    error: "Please wait 60 seconds before resending the password reset email."
                });
            }
        }

        const currentUrl = process.env.APP_URL;
        const expirationTime = 6 * 60 * 60 * 1000; // 6 hr

        const token = uuidv4() + _id;

        const { name: userName } = await dbHelper.getUserName(_id);
        console.log(userName);

        const recipient = [
            new Recipient(email, userName)
        ];

        const resetPasswordUrl = `${currentUrl}/account/forgot-password/${_id}/${token}`

        const variables = [{
            email: email,
            substitutions: [{
                var: 'url',
                value: 'collarcode.co.uk'
            }],
        }];

        const personalization = [{
            email: email,
            data: {
                name: userName,
                resetLink: resetPasswordUrl,
                account_name: 'CollarCode',
                support_email: 'support@collarcode.co.uk'
            },
        }];

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipient)
            .setReplyTo(sentFrom)
            .setSubject("CollarCode | Reset Your Password")
            .setTemplateId('7dnvo4dd02r45r86')
            .setVariables(variables)
            .setPersonalization(personalization);

        const hashedToken = await dbHelper.hashString(token);

        await saveResetTokenData(_id, hashedToken, expirationTime);

        await mailerSend.email.send(emailParams);

        // await transporter.sendMail(mailOptions);

        // generic success, dont tell user if it worked or not
        return res.status(200).json({
            status: "PENDING",
            message: "Password Reset Email Sent"
        });
    } catch (error) {
        console.error("Error during sendPasswordResetEmail:", error);

        let errorMessage = "An error occurred during password reset email.";

        if (error.message.includes("hashing")) {
            errorMessage = "Failed to hash password reset data!";
        } else if (error.message.includes("sending")) {
            errorMessage = "Error sending password reset email.";
        }

        return res.status(400).json({
            status: "FAILED",
            error: errorMessage
        });
    }
};

const checkResetToken = async ({
    _id,
    token
}) => {
    try {
        const result = await dbHelper.getResetTokenData(_id);
        console.log('result from here:', result);
        if (result) {
            const {
                expires_at,
                token: storedToken
            } = result;

            if (expires_at < Date.now()) {

                try {
                    const deleteResult = await executeMysqlQuery('DELETE FROM password_reset WHERE user_id = ?', [_id]);

                    if (deleteResult && deleteResult[0] && deleteResult[0].affectedRows !== undefined) {
                        console.log(`Deleted ${deleteResult[0].affectedRows} row(s)`);
                    } else {
                        console.error('Error deleting password reset:', deleteResult);
                    }

                    return {
                        status: "FAILED",
                        error: "Password reset link has expired. Please request a new one."
                    };
                } catch (error) {
                    console.error('Error in DELETE operation:', error);
                    return {
                        status: "FAILED",
                        error: "An error has occured. Try again."
                    };
                }
            } else {
                const decryptedToken = decrypt(storedToken);
                console.log(decryptedToken === token);

                if (decryptedToken === token) {
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
    }
};

const resetPassword = async (req, res) => {
    let password = req.body.password;
    let _id = req.params._id
    let token = req.params.token

    try {
        tokenResult = await checkResetToken({
            _id,
            token
        });

        if (tokenResult.status === "SUCCESS") {
            const validationError = validateResetPasswordInput(password)
            if (validationError) {
                return res.status(400).json(validationError);
            }

            const hashedPassword = await dbHelper.hashString(password);

            const saveNewPassword = await dbHelper.changePassword(_id, hashedPassword);

            if (saveNewPassword) {
                res.json({
                    status: "SUCCESS",
                });
                await executeMysqlQuery('DELETE FROM password_reset WHERE user_id = ?', [_id]);
            } else {
                res.json({
                    status: "FAILED",
                    error: {
                        other: 'Failed to save new password, please try again.'
                    }
                });
            }
        }

    } catch (error) {
        console.error(error);
        return {
            status: "FAILED",
            error: "An error has occured. Try again."
        };
    }
}

module.exports = {
    sendPasswordResetEmail,
    checkResetToken,
    resetPassword,
};