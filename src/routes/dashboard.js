const Router = require('../classes/Router');
require('dotenv').config();

class DashboardRoutes extends Router {
    constructor(client) {
        super(client, '/dashboard');
    }

    createRoute() {

        this.router.get('/', (req, res) => {
            if (req.session && req.session.user) {
                res.render('static/dashboard');
            } else {
                res.redirect('/account/signin?sessionexpired');
            }
        });

        this.router.use((req, res) => {
            res.status(404).render('static/404')
        });

        return this.router
    }
}

module.exports = DashboardRoutes;