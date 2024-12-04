const express = require('express');
const multer = require('multer');
const commonController = require('../controllers/commonController');
const router = express.Router();

// NOTE : Multer 설정 (메모리 저장소 사용)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// NOTE : 파일 업로드 라우트
router.post('/', upload.single('profileImage'), commonController.uploadFile);

module.exports = router;
