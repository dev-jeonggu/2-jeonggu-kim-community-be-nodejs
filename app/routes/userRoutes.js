const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require("../middleware/authenticateToken");

router.patch('/', authenticateToken, userController.updateUser);
router.post('/', userController.addUser);
router.get('/check',  userController.check);
router.get('/', authenticateToken, userController.getUserInfo);
router.delete('/', authenticateToken, userController.deleteUser);

/* NOTE : common으로 파일업로드 및 파일로드를 대체했으나, 기존 사진으로 인해 추후에 제거 */
router.get('/image/:filename', userController.loadImage);

module.exports = router;