const usercontroller=require('../Controller/userController');
const  express=require('express');
const router= express.Router();

router.post('/userRegister',usercontroller.userRegister);
router.post('/usersignin',usercontroller.userSignin);
router.get('/getallusers',usercontroller.getallusers);
router.post('/getuser',usercontroller.getuserByid);
router.post('/updateUser',usercontroller.updateUser);
router.post('/forgotPassword',usercontroller.forgotPassword);
router.post('/verifyForgotPasswordOtp',usercontroller.verifyForgotPasswordOtp);
router.post('/resetPassword',usercontroller.resetPassword);

router.patch("/:id/password" , usercontroller.changePassword)

module.exports=router
 