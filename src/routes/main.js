const Router = require('../classes/Router');
const { getPetData } = require('../utilities/data/User');
require('dotenv').config();

class MainRoute extends Router {
    constructor(client) {
        super(client, '/');
    }

    createRoute() {
        this.router.get('/', (req, res) => res.render('static/landing'));

        
        this.router.get('/no-script', (req, res) => res.render('static/noScript'));
        this.router.get('/favicon.ico', (req, res) => res.sendFile('favicon.ico', { root: './src/public/static' }));

        this.router.get('/pet/:petId', async (req, res) => {
            const petId = req.params.petId;

            try {
                const petData = await getPetData(petId);
                console.log(petData);
                
                if (petData) {
                    // pet exists
                    return res.render('user management/petProfile', { petData })
                } else {
                    // verification failed
                    return res.render('user management/petProfile', { status: "FAILED", error: "Pet does not exist." });
                }
            } catch (error) {
                console.error(error);
                return res.render('errorPage'); // prob best to not just 404 them aye
            }
        });

        this.router.use((req, res) => {
            res.status(404).render('static/404')
        });

        return this.router
    }
}

module.exports = MainRoute;