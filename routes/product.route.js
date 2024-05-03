var express = require('express');
var router = express.Router();
const { productAdd, productUpdate, getProduct, deleteProduct } = require('../controller/productController')
const { verifyToken } = require('../middleware/tokenAuth')
const upload = require('../helper/uploadFile')

/* GET home page. */
router.post('/addProduct', verifyToken, upload.fields([{ name: 'image' }]), productAdd);
router.patch('/updateProduct', verifyToken, upload.fields([{ name: 'image' }]), productUpdate);
router.get('/getProduct', verifyToken, getProduct);
router.delete('/deleteProduct', verifyToken, deleteProduct);

module.exports = router;



