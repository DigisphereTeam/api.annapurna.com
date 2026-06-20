const carouselcontroller = require('../Controller/carouselController');
const express = require('express');
const upload = require('../utils/uploadfile.js');
const router = express.Router();


router.post('/addcarousel', upload.array('carousel_image', 5), carouselcontroller.addCarousel);


router.get('/getallcarousel', carouselcontroller.getallCarousels);
router.post('/getcarouselByid', carouselcontroller.getcarouselByid);
router.post('/updatecarousel', upload.fields([
    { name: 'carousel_image', maxCount: 1 }]), carouselcontroller.updatecarousel);

router.post('/deletecarousel', carouselcontroller.deleteCarousel);


module.exports = router
