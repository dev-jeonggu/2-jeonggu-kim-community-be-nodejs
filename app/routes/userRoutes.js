const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require("../middleware/authenticateToken");

router.patch('/', authenticateToken, userController.updateUser);
router.post('/', userController.addUser);
router.get('/check',  userController.check);
router.get('/', authenticateToken, userController.getUserInfo);
router.delete('/', authenticateToken, userController.deleteUser);

module.exports = router;