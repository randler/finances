var express = require('express');
var router = express.Router();

const dashboardController = require('../controllers/dashboard/index');

/* GET home page. */
router.get('/', dashboardController.getFinances );

module.exports = router;
