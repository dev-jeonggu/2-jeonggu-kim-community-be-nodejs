const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const authenticateToken = require("../middleware/authenticateToken");

router.get('/', boardController.getBoardList);
router.get('/:board_id', authenticateToken, boardController.getBoardInfo);
router.post('/', authenticateToken, boardController.addBoard);

router.put('/:board_id', authenticateToken, boardController.editBoard);
router.delete('/:board_id', authenticateToken, boardController.deleteBoard);

router.post('/like', authenticateToken, boardController.likeBoard);
router.patch('/view/:board_id', authenticateToken, boardController.addViewCount);

/* NOTE : common으로 파일업로드 및 파일로드를 대체했으나, 기존 사진으로 인해 추후에 제거 */
router.get('/image/:filename', boardController.loadImage);
module.exports = router;