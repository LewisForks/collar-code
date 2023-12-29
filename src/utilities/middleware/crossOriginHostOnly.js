const cors = require('cors');

const whitelist = [process.env.HOSTNAME]
const corsOptions = {
    origin: (origin, callback) => {
        if ((whitelist.indexOf(origin) !== -1)) {
            callback(null, true)
        } else {
            callback(new Error('CORS_BLOCKED'))
        }
    },

    optionsSuccessStatus: 204
};

const crossOriginHostOnly = cors(corsOptions);

module.exports = { crossOriginHostOnly };