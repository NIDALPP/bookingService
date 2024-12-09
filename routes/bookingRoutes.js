const express = require('express')
const router = express.Router()
const controller = require('../controller/bookingController')
const {userAuth} = require('../helpers/userAuth')



router.post('/showProducts', controller.ShowAll)
router.post('/showAllProducts', controller.showAllProduct)
router.post('/addToCart',userAuth, controller.addToCart)
router.post('/placeOrder',userAuth, controller.placeOrder)
module.exports = router