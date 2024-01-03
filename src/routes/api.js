const Router = require('../classes/Router');
require('dotenv').config();

class API extends Router {
    constructor(client) {
        super(client, '/api');
    }

    createRoute() {
        this.router.get('/status-check', (req, res) => {
            res.status(200).json({
                "status": "ok",
            });
        });

        this.router.use((req, res) => {
            res.status(404).json({
                "error": "This API endpoint is invalid or has moved.",
                "@see": "https://support.collarcode.net/404"
            });
        });

        return this.router
    }
}

module.exports = API;