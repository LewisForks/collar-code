const { encrypt } = require("../aes");
const Logger = require("../consoleLog");
const { executeMysqlQuery } = require("../mysqlHelper");

async function checkUserExists(email) {
    try {
        const query = await executeMysqlQuery('SELECT * FROM users WHERE email = ?', [email])
        console.log(query);
        return query.length > 0;
    } catch (error) {
        Logger.error('Error checking if user exists:', error);
        throw error;
    }
}

const checkVerified = async (email) => {
    try {
        const rows = await executeMysqlQuery('SELECT verified FROM users WHERE email = ?', [email]);
        console.log(rows)

        if (rows.length > 0) {
            // const isVerified = rows[0].verified === 1;
            console.log('true')
            return true;
        } else {
            // not verified
            console.log('false')
            return false;
        }
    } catch (error) {
        Logger.error('Error checking user verification:', error);
        throw error;
    }
};

const getUserData = async (userId) => {
    try {
        const rows = await executeMysqlQuery('SELECT * FROM users WHERE user_id = ?', [userId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        Logger.error('Error getting user data:', error);
        throw error;
    }
};

const getUserId = async (email) => {
    try {
        const rows = await executeMysqlQuery('SELECT user_id from users where email = ?', [email]);

        return rows.length > 0 ? rows[0] : 0;
    } catch (error) {
        Logger.error('Error getting user id:', error);
        throw error;
    }
}

const getUserEmail = async (userId) => {
    try {
        const rows = await executeMysqlQuery('SELECT email from users where user_id = ?', [userId]);

        return rows.length > 0 ? rows[0] : 0;
    } catch (error) {
        Logger.error('Error getting user id:', error);
        throw error;
    }
}

const getUserName = async (userId) => {
    try {
        const rows = await executeMysqlQuery('SELECT name from users where user_id = ?', [userId])

        return rows.length > 0 ? rows[0] : 0;
    } catch (error) {
        Logger.error('Error getting user id:', error);
        throw error;
    }
}

const getHashedPassword = async (userId) => {
    try {
        const rows = await executeMysqlQuery('SELECT password from users where user_id = ?', [userId])

        return rows.length > 0 ? rows[0] : 0;
    } catch (error) {
        Logger.error('Error getting hashed password:', error);
        throw error;
    }
};

const getVerificationData = async (userId) => {
    try {
        const rows = await executeMysqlQuery('SELECT * FROM user_verification WHERE user_id = ?', [userId]);

        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        Logger.error('Error getting verification data:', error);
        throw error;
    }
};

const getResetTokenData = async (_id) => {
    try {
        const rows = await executeMysqlQuery('SELECT * FROM password_reset WHERE user_id = ?', [_id]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        Logger.error('Error getting reset token data:', error);
        throw error;
    }
};

const changePassword = async (_id, password) => {
    try {
        const rows = await executeMysqlQuery('UPDATE users SET password = ? WHERE user_id = ?', [password, _id]);
        return rows.affectedRows > 0 ? true : false;
    } catch (error) {
        Logger.error('Error changing password:', error);
        throw error;
    }
}

const hashString = async (string) => {
    let hashedString = encrypt(string);
    return hashedString;
};

const checkPetCount = async (userId) => {
    try {
        const petsCount = await executeMysqlQuery('SELECT COUNT(*) AS numberOfPets FROM pets WHERE user_id = ?', [userId]);

        return petsCount.length > 0 ? petsCount[0].numberOfPets : 0;
    } catch (error) {
        Logger.error('Error getting user pets count:', error);
        throw error;
    }
};

const getPetData = async (petId) => {
    try {
        const rows = await executeMysqlQuery('SELECT * FROM pets WHERE pet_id = ?', [petId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        Logger.error('Error getting pet data:', error);
        throw error;
    }
};


module.exports = {
    checkUserExists,
    checkVerified,
    getUserData,
    getUserId,
    getUserEmail,
    getUserName,
    getHashedPassword,
    getVerificationData,
    getResetTokenData,
    changePassword,
    hashString,
    checkPetCount,
    getPetData,
};