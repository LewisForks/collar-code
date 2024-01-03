const Router = require('../classes/Router');
require('dotenv').config();

class MainRoute extends Router {
    constructor(client) {
        super(client, '/');
    }

    createRoute() {
        this.router.get('/', (req, res) => res.render('static/landing'));

        
        this.router.get('/no-script', (req, res) => res.render('static/noScript'));
        this.router.get('/favicon.ico', (req, res) => res.sendFile('favicon.ico', { root: './src/public/static' }));

        this.router.use((req, res) => {
            res.status(404).render('static/404')
        });

        return this.router
    }
}

module.exports = MainRoute;