const express = require('express');
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const commentController = require('../controllers/commentController');

router.get('/:board_id', authenticateToken, commentController.getCommentsByBoardId);
router.delete('/:comment_id', authenticateToken, commentController.deleteComment);
router.patch('/:comment_id', authenticateToken, commentController.editComment);
router.post('/', authenticateToken, commentController.addComment);

module.exports = router;