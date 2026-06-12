const express = require("express");
const contanctRouter = express.Router();
const contactController = require("../Controller/contactusController");

contanctRouter.post("/", contactController.contactUs);

module.exports = contanctRouter;