const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');
const isAuth = require('../middlewares/isAuth');

router.get('/', isAuth, userController.getUsers);

module.exports = router;