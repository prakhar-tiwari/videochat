const express = require('express');
const router = express.Router();

const chatRoomController = require('../controllers/chatroom');

router.get('/', chatRoomController.getchatroom);

module.exports = router;