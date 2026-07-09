const express = require("express");
const contanctRouter = express.Router();
const contactController = require("../Controller/contactusController");

contanctRouter.post("/", contactController.contactUs);
contanctRouter.post("/digisphere", contactController.submitContactInquiry)

module.exports = contanctRouter;