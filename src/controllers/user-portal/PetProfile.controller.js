const { validateSignupInput, validatePetProfileInput } = require('./Validation.controller');
const { sendVerificationEmail } = require('./EmailVerification.controller');
const path = require('path');
const mysql = require('mysql2/promise');
const dbHelper = require('../../utilities/data/User');
const { executeMysqlQuery } = require('../../utilities/mysqlHelper');
const { decrypt, encrypt } = require('../../utilities/aes');


require('dotenv').config();

async function savePet(userId, petId, petName, petBreed, petAge) {
    try {
        const result = await executeMysqlQuery(
            'INSERT INTO pets (user_id, pet_id, petName, petBreed, petAge) VALUES (?, ?, ?, ?, ?)',
            [userId, petId, petName, petBreed, petAge]
        );

        return {
            status: "SUCCESS",
            message: "Pet profile data saved.",
            petId: petId
        }
    } catch (error) {
        console.error('Error saving pet to database:', error);
        throw error;
    }
}

const createPetProfile = async (req, res) => {
    try {
        let { petName, petBreed, petAge } = req.body;
        petName = petName.trim();
        petBreed = petBreed.trim();
        petAge = petAge.trim();

        const encryptedUserId = (req.session.user.userId)
        const userId = decrypt(encryptedUserId);

        const checkPetCount = await dbHelper.checkPetCount(userId);
        console.log(checkPetCount);
        if (checkPetCount > 2) {
            return res.json({
                status: 'FAILED',
                error: {
                    other: "You have reached the maximum of 3 pets. Purchase a higher plan for more."
                }
            });
        }

        const validationError = validatePetProfileInput(petName, petBreed, petAge);
        if (validationError) {
            return res.status(400).json(validationError);
        }

        const petId = `${Date.now()}${Math.random()}`

        savePetResponse = await savePet(userId, petId, petName, petBreed, petAge);

        res.json(savePetResponse);
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
    createPetProfile,
};
