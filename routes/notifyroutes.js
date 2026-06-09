const express=require('express');
const router=express.Router();
const notifycontroller=require('../Controller/notifyController');


router.post('/notifyRequest',notifycontroller.notifyRequest);
router.get('/getnotifyrequest',notifycontroller.getAllNotifyRequests);
router.post('/getusernotify',notifycontroller.getUserNotifications);
router.post('/updatenotifystatus',notifycontroller.updateAndDeleteNotify);



module.exports =router;
