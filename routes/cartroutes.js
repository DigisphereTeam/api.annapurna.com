const cartcontroller=require('../Controller/cartController');
const  express=require('express');
const router= express.Router();
 

router.post('/addcart', cartcontroller.addCart);
router.post('/getcartdetails',cartcontroller.getcartuserByid);
router.post('/updateCartproduct',cartcontroller.updatecartproduct);
router.post('/deletecart',cartcontroller.deleteCart);
router.post('/deleteallcart',cartcontroller.deleteallCart);
router.get('/getallcarts',cartcontroller.getallCarts);


module.exports=router
 