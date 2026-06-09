const categorycontroller=require('../Controller/categoryController');
const  express=require('express');
const router= express.Router();
const upload=require('../utils/fileupload');


router.post('/addCategory',upload.fields([
    {name:'category_image',maxCount:1}]),categorycontroller.addCategory);

router.get('/getallcategories',categorycontroller.getallCategories);
router.post('/getcategoryByid',categorycontroller.getcategoryByid);
router.post('/updatecategory',upload.fields([
    {name:'category_image',maxCount:1}]),categorycontroller.updateCategory);
router.post('/deletecategory',categorycontroller.deleteCategory);


module.exports=router
 