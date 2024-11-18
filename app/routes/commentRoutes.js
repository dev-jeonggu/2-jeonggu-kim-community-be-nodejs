const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.get('/:boardNo', commentController.getCommentsByBoardNo);
router.delete('/:commentNo', commentController.deleteComment);
router.patch('/:commentNo', commentController.editComment);
router.post('/', commentController.addComment);

module.exports = router;