const productcontroller=require('../Controller/productsController');
const  express=require('express');
const router= express.Router();
const upload=require('../utils/fileupload');

router.post('/addproduct',upload.fields([
    {name:'product_image',maxCount:1}]), productcontroller.addproduct);

router.get('/getallProduct',productcontroller.getAllProduct)
router.post('/getproductbyId',productcontroller.getProductById);
router.post('/updateProduct',upload.fields([
    {name:'product_image',maxCount:1}]), productcontroller.updateProduct);

router.post('/deleteProduct',productcontroller.deleteProduct);
router.post('/getproductsBycategory',productcontroller.getproductBycategory);
router.post('/updateProductStatus',productcontroller.updateProductStatus);
router.get('/getAllcategoryproducts',productcontroller.getallcategoryproducts);

  
module.exports=router