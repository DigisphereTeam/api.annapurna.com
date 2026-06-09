const dashboardController = require('../Controller/dashboardController');

const express = require('express');
const router = express.Router();

router.get('/orderStatusCount',  dashboardController.getOrderStatusCounts);
router.post('/getOrdersByStatus',dashboardController.getOrdersByStatus);

module.exports = router
