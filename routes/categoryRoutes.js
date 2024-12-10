const express =require('express')
const router=express.Router()
const controller=require('../controller/categoryController')


router.post('/ShowCategories',controller.ShowAllCat)
router.post('/showProducts',controller.showAllProduct)
module.exports=router