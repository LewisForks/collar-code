const { validateSignupInput } = require('./Validation.controller');
const { sendVerificationEmail } = require('./EmailVerification.controller');
const path = require('path');
const mysql = require('mysql2/promise');
const dbHelper = require('../../utilities/data/User');
const { executeMysqlQuery } = require('../../utilities/mysqlHelper');
const { decrypt, encrypt } = require('../../utilities/aes');
