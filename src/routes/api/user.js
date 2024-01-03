const Router = require('../../classes/Router');
require('dotenv').config();

const { handleSignup } = require('../../controllers/user-portal/SignUp.controller');
const { handleSignin, renderSignin } = require('../../controllers/user-portal/SignIn.controller');

const { convertError } = require('../../utilities/middleware/convertError');
const { crossOriginHostOnly } = require('../../utilities/middleware/crossOriginHostOnly');

class API_User extends Router {
    constructor(client) {
        super(client, '/api/user-portal');
    }

    createRoute() {
        this.router.use(crossOriginHostOnly);
        this.router.use(convertError);

        this.router.post('/signup', handleSignup);
        this.router.post('/signin', handleSignin);

        this.router.use((req, res) => {
            res.status(404).json({
                "error": "This API endpoint is invalid or has moved."
            });
        });

        return this.router
    }
};

module.exports = API_User;