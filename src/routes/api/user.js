const { executeMysqlQuery } = require('../../utilities/mysqlHelper');
const Router = require('../../classes/Router');
const { encrypt, decrypt } = require('../../utilities/aes');
const fetch = require('node-fetch-commonjs');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

// MailerSend initialisation example
/**
 * const { MailerSend, Recipient, EmailParams } = require('mailersend');
 * const ms = new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY });
 **/

const { convertError } = require('../../utilities/middleware/convertError');
const { crossOriginHostOnly } = require('../../utilities/middleware/crossOriginHostOnly');

class API_User extends Router {
    constructor(client) {
        super(client, '/api/tmpl');
    }

    createRoute() {
        this.router.use(crossOriginHostOnly);
        this.router.use(convertError);

        // FULL PATH: /api/tmpl/example/"something here that will be stored in variable test"
        this.router.get('/example/:test', async (req, res) => {
            return res.status(200).json({ "input": req.params.test });
        });

        this.router.use((req, res) => {
            res.status(404).json({
                "error": "This API endpoint is invalid or has moved."
            });
        });

        return this.router
    }
};

module.exports = API_User;