var express = require('express');
var router = express.Router();
const {login} = require('../controller/adminController')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/admin/login',login)
module.exports = router;
