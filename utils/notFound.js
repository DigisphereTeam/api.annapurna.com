const sendErrorResponse = require("./sendErrorResponse.js");
const notFoundController = (req, res) => {
    return sendErrorResponse(res, 404, `Route ${req.originalUrl} not found`)
};

module.exports = notFoundController;