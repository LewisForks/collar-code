const { validateSignupInput } = require('./Validation.controller');
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

