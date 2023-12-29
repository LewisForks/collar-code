const convertError = (err, req, res, next) => {
    let errorMessage = "An internal error occured."
    let errorCode = 500;

    if (err) {
        switch(err.message) {
            case 'CORS_BLOCKED': {
                errorMessage = "Cross-origin is disallowed for this endpoint.";
                errorCode = 403;
                break;
            }
        }

        return res.status(errorCode).json({ status: errorCode, message: errorMessage });
    } else next();
};

module.exports = { convertError };