const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const multer = require('multer');
const path = require('path');
const authenticateToken = require("../middleware/authenticateToken");

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../images/board')); // NOTE : 파일 저장 경로
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // NOTE : 파일 이름 설정
    }
});

const upload = multer({ storage: storage });

router.get('/', boardController.getBoardList);
router.post('/', authenticateToken, boardController.addBoard);

router.get('/:board_id', authenticateToken, boardController.getBoardInfo);
router.put('/:board_id', authenticateToken, boardController.editBoard);
router.delete('/:board_id', authenticateToken, boardController.deleteBoard);

// router.get('/boardInfo', boardController.getBoardInfo);
router.post('/like', authenticateToken, boardController.likeBoard);
router.patch('/view/:board_id', authenticateToken, boardController.addViewCount);
router.post('/image', upload.single('boardImage'), boardController.uploadImage);

module.exports = router;