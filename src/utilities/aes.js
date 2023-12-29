const crypto = require('crypto');
require('dotenv').config( { 'path': __dirname+'/../.env' });
const algorithm = 'aes-256-ctr';
const secretKey = process.env.ENC_KEY || '259df7f7437795bfd3a1361d2567a39c'; // crypto.randomBytes(16).toString('hex')
const iv = Buffer.from(process.env.ENC_IV || '9c7de13b11825c9792c9dbc7317c9b41', 'hex'); // crypto.randomBytes(16).toString('hex')

const encrypt = (text) => {
    // This line creates a cipher object with the algorithm, secret key, and iv
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    // This line encrypts the text passed in using the cipher object and returns a buffer
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    // This line returns the buffer as a hex string
    return encrypted.toString('hex');
};

const decrypt = (hash) => {
    // This line creates a decipher object with the algorithm, secret key, and iv
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    // This line decrypts the hash passed in using the decipher object and returns a buffer
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);
    // This line returns the buffer as a string
    return decrpyted.toString();
};

module.exports = { encrypt, decrypt };