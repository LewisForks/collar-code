const session = require("express-session");
const dbHelper = require('../../utilities/data/User');
const { decrypt } = require("../../utilities/aes");
const { executeMysqlQuery } = require("../../utilities/mysqlHelper");
const { validateAccountUpdateInput } = require("../user-portal/Validation.controller");
const qrcode = require('qrcode');


const renderDashboard = async (req, res) => {
    if (req.session && req.session.user) {
        const sessionInfo = req.session;
        console.log(sessionInfo);

        const userId = decrypt(req.session.user.userId)
        const userDataResults = await dbHelper.getUserData(userId);

        const userData = {
            userId, userId,
            name: userDataResults.name,
            email: userDataResults.email,
            dob: formatDate(userDataResults.dateOfBirth)
        }

        const petDataResults = await executeMysqlQuery('SELECT * FROM pets WHERE user_id = ?', [userId])
        console.log(petDataResults);

        const currentUrl = process.env.APP_URL

        const qrCodeOptions = {
            color: {
                dark: '#000000', // Set your desired foreground color
                light: '#0000'    // Set a transparent background
            },
            margin: 1
        };

        const petData = await Promise.all(petDataResults.map(async pet => ({
            userId: pet.user_id,
            petId: pet.pet_id,
            petName: pet.petName,
            petBreed: pet.petBreed,
            petAge: parseInt(pet.petAge),
            qrCodeData: await qrcode.toDataURL(`${currentUrl}/pet/` + pet.pet_id, qrCodeOptions)
        })));


        console.log(petData);

        res.render('static/dashboard', { userData, petData });

        function formatDate(inputDate) {
            const date = new Date(inputDate);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const year = date.getFullYear();

            return `${year}-${month}-${day}`;
        }
    } else {
        res.redirect('/account/signin?sessionexpired');
    }
}

async function updateUser(userId, name, email, password, dateOfBirth) {
    try {
        const result = await executeMysqlQuery(
            'UPDATE users SET name = ?, email = ?, password = ?, dateOfBirth = ? WHERE user_id = ?',
            [name, email, password, dateOfBirth, userId]
        );
    } catch (error) {
        console.error('Error saving user to database:', error);
        throw error;
    }
}

const updateAccountDetails = async (req, res) => {
    try {
        let { name, email, password, dateOfBirth, confirmPassword } = req.body;
        name = name.trim();
        email = email.trim();
        password = password.trim();
        dateOfBirth = dateOfBirth.trim();
        confirmPassword = confirmPassword.trim();
        const userId = decrypt(req.session.user.userId)
        const currentHashedPassword = await dbHelper.getHashedPassword(userId)

        if (!confirmPassword) {
            return res.json({
                status: "FAILED",
                errors: {
                    password: 'Enter Current Password'
                }
            });
        }

        const decryptedPassword = decrypt(currentHashedPassword);

        const validationError = validateAccountUpdateInput(name, email, password, dateOfBirth);
        if (validationError) {
            return res.status(400).json(validationError);
        }

        if (decryptedPassword === confirmPassword) {
            var hashedPassword = await dbHelper.hashString(password);

            if (!password) {
                hashedPassword = currentHashedPassword;
            }

            await updateUser(userId, name, email, hashedPassword, dateOfBirth);

            res.json({
                status: "SUCCESS",
                message: "Account Details Updated"
            });
        } else {
            return res.json({
                status: "FAILED",
                errors: {
                    password: 'Incorrect Current Password'
                }
            });
        }
    } catch (err) {
        console.error(err);
        res.json({
            status: 'FAILED',
            message: 'An error occurred during signup.',
            error: err.message,
        });
    }
}

module.exports = {
    renderDashboard,
    updateAccountDetails
}