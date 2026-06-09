const couponController = require('../Controller/couponsController')
const  express=require('express');
const router= express.Router();

router.post('/addCoupon',couponController.addCoupon);
router.get('/getallCoupons',couponController.getallCoupons);
router.post('/getcouponByid',couponController.getcouponsByid);
router.post('/deleteCoupon',couponController.deleteCoupon);
router.post('/updateCoupons',couponController.updatecoupon);
router.get('/getActiveCoupons',couponController.getactiveCoupons);


module.exports=router
 