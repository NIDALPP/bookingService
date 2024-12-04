const express = require('express')
const router = express.Router()
const controller = require('../controller/bookingController')



router.post('/showProducts', controller.ShowAll)
router.post('/showAllProducts', controller.showAllProduct)
router.post('/addToCart', controller.addToCart)
router.post('/placeOrder', controller.placeOrder)
module.exports = router