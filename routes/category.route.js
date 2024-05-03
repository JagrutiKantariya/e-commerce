var express = require('express');
var router = express.Router();
const {categoryAdd,categoryUpdate,getCategory,deleteCategory} = require('../controller/categoryController')
const {verifyToken} = require('../middleware/tokenAuth')
/* GET home page. */
router.post('/addCategory',verifyToken, categoryAdd);
router.patch('/updateCategory',verifyToken, categoryUpdate);
router.get('/getCategory',verifyToken, getCategory);
router.delete('/deleteCategory',verifyToken, deleteCategory);

module.exports = router;



