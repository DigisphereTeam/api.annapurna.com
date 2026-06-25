const adminController=require('../Controller/adminController');
const reportRoutes = require("../routes/reportsRoutes.js");
const express=require('express');
const router=express.Router();

router.post('/register',adminController.register);
router.post('/adminlogin',adminController.adminLogin);
router.use("/" , reportRoutes);

module.exports=router