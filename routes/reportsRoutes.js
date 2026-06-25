const express = require("express");

const reportsController = require("../Controller/reportsController.js")

const reportsRoutes = express.Router();

reportsRoutes.get("/reports" , reportsController.getAdminReportData);

module.exports = reportsRoutes;