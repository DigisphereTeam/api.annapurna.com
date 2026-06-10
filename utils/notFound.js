const sendResponse = require("./sendResponse.js");
const notFoundController = (req, res) => {
    return sendResponse(res, 404, `Route ${req.originalUrl} not found`)
};

module.exports = notFoundController;