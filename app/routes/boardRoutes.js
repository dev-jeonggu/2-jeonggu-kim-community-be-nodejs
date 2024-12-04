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

module.exports = router;