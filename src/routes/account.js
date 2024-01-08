const Router = require('../classes/Router');
const { sendPasswordResetEmail, resetPassword, checkResetToken } = require('../controllers/user-portal/PasswordReset.controller');
const { checkVerification } = require('../controllers/user-portal/EmailVerification.controller');
const { createPetProfile } = require('../controllers/user-portal/PetProfile.controller');
const { getPetData } = require('../utilities/data/User');
require('dotenv').config();

class AccountRouter extends Router {
    constructor(client) {
        super(client, '/account');
    }

    createRoute() {
        /**
         * Render Routes
         */
        this.router.get('/', (req, res) => res.redirect('/account/signin'));
        this.router.get('/signup', (req, res) => {
            if (req.session && req.session.user) {
                res.redirect('/dashboard');
            } else {
                res.render('user management/signUp')
            }
        });
        this.router.get('/signin', (req, res) => {
            if (req.session && req.session.user) {
                res.redirect('/dashboard');
            } else {
                res.render('user management/signIn');
            }
        });
        this.router.get('/verify', (req, res) => res.render('user management/verifyEmail'));
        this.router.get('/forgot-password', (req, res) => res.render('user management/forgotPasswordForm'));
        this.router.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/account/signin'); });
        this.router.get('/create-pet-profile', (req, res) => res.render('user management/createPetProfile'));

        /**
         * Logic Routes
         */
        this.router.get('/verify/:userId/:uniqueString', async (req, res) => {
            const { userId, uniqueString } = req.params;

            try {
                const verificationResult = await checkVerification({ userId, uniqueString });

                if (verificationResult.status === "SUCCESS") {
                    // verification success
                    return res.redirect('/account/signin?verificationsuccess');
                } else {
                    // verification failed
                    console.error("failed")
                    return res.render('user management/verifyEmail', { error: verificationResult.message });
                }
            } catch (error) {
                console.error(error);
                return res.render('errorPage'); // prob best to not just 404 them aye
            }
        });

        this.router.post('/forgot-password', sendPasswordResetEmail);
        this.router.get('/forgot-password/:_id/:token', async (req, res) => {
            const { _id, token } = req.params;

            try {
                const forgotPasswordResult = await checkResetToken({ _id, token });

                if (forgotPasswordResult.status === "SUCCESS") {
                    // verification success
                    console.log(_id, token)
                    return res.render('user management/resetPasswordForm', { _id, token });
                } else {
                    // verification failed
                    console.log('forgot password errors:', forgotPasswordResult.error);
                    return res.render('user management/forgotPasswordForm', { error: forgotPasswordResult.error, status: forgotPasswordResult.status });
                }
            } catch (error) {
                console.error(error);
                return res.render('errorPage'); // prob best to not just 404 them aye
            }
        });

        this.router.post('/reset-password/:_id/:token', resetPassword);

        this.router.post('/create-pet-profile', createPetProfile);

        this.router.use((req, res) => {
            res.status(404).render('static/404')
        });

        return this.router;
    }
}

module.exports = AccountRouter;