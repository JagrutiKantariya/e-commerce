var express = require('express');
var router = express.Router();
const {login,addToCart,getCart,placeOrder} = require('../controller/customerController')
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/login',login)
router.post('/addToCart',addToCart)
router.post('/getCart',getCart)
router.post('/placeOrder',placeOrder)
module.exports = router;
