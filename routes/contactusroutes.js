const express = require("express");
const router = express.Router();
const { contactUs } = require("../Controller/contactusController");

router.post("/contactus", contactUs);

module.exports = router;