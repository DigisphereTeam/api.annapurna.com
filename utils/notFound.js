const sendErroResponse = require("./sendErrorResponse.js");
const notFoundController = (req, res) => {
    return sendErroResponse(res, 404, `Route ${req.originalUrl} not found`)
};

module.exports = notFoundController;