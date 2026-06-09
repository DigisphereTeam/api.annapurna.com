const ordercontroller=require('../Controller/orderController');

const  express=require('express');
const router= express.Router();

 router.post('/addorder',ordercontroller.addOrder);
 router.post('/getorderdetailssuserbyid',ordercontroller.getOrderDetailsByUserId);
 router.get('/getOrders',ordercontroller.getorders);
 router.post('/getorderproducts',ordercontroller.getOrderItems);
 router.post('/updateOrderstatus',ordercontroller.updateOrderStatus);


module.exports=router
 