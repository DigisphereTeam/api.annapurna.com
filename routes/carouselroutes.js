const carouselcontroller=require('../Controller/carouselController');
const  express=require('express');
const router= express.Router();
const upload=require('../utils/uploadfile');
const uploadfle=require('../utils/fileupload');

router.post('/addcarousel', upload.array('carousel_image', 5), carouselcontroller.addCarousel);


router.get('/getallcarousel',carouselcontroller.getallCarousels);
router.post('/getcarouselByid',carouselcontroller.getcarouselByid);
router.post('/updatecarousel',uploadfle.fields([
    {name:'carousel_image',maxCount:1}]),carouselcontroller.updatecarousel);

router.post('/deletecarousel',carouselcontroller.deleteCarousel);


module.exports=router
 