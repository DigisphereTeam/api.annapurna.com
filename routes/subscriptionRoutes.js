const express = require("express");
const { createSubscription } = require("../Controller/subscriptionController");
const subscriptionRouter = express.Router();

subscriptionRouter.post("/", createSubscription);

module.exports = subscriptionRouter;