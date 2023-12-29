console.clear();

(async function () {
    const Client = new (require("./src/classes/App.js"))
    const Logger = require('./src/utilities/consoleLog.js');

    await Client.registerRoutes();
    await Client.listen(() => {
        Logger.info(`Server listening on ${process.env.EXPRESS_IP}:${process.env.EXPRESS_PORT}`);
    }, true);
})();