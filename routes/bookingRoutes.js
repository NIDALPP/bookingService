const express =require('express')
const router=express.Router()
const controller=require('../controller/bookingController')



router.post('/showProducts',controller.ShowAll)
router.post('/showAllProducts',controller.showAllProduct)
module.exports=router