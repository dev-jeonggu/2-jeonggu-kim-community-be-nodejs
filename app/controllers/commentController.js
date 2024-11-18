const commentModel = require('../models/commentModel');

exports.addComment = async (req, res) => {
    const { boardNo, content } = req.body;
    const email = req.session.user.email;
    const userId = req.session.user.id;

    if (!boardNo || !content) {
        return res.status(400).json({ message: 'Content is required' });
    }

    try {
        const result = await commentModel.addComment({ boardNo, content, email, userId });
        res.status(200).json({ message: 'success', data: result });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'server error', data: null });
    }
};

exports.getCommentsByBoardNo = async (req, res) => {
    const boardNo = req.params.boardNo;
    if (!boardNo) {
        return res.status(400).json({ message: 'Content is required' });
    }

    try {
        const comments = await commentModel.getCommentsByBoardNo(parseInt(boardNo));
        const userEmail = req.session.user ? req.session.user.email : null;

        // NOTE : 각 댓글에 isAuthor 필드를 추가
        comments.forEach(comment => {
            comment.isAuthor = comment.email === userEmail;
        });

        res.status(200).json({ message: 'success', data: comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'server error', data: null });
    }
};

exports.editComment = async (req, res) => {
    const commentNo = parseInt(req.params.commentNo, 10);
    const { content } = req.body; // 수정할 댓글 내용 가져오기

    if (!content) {
        return res.status(400).json({ message: 'Content is required' });
    }

    try {
        const success = await commentModel.updateComment(commentNo, content);
        if (success) {
            res.status(200).json({ message: 'success' });
        } else {
            res.status(404).json({ message: 'comment not found' });
        }
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'server error' });
    }
};
exports.deleteComment = async (req, res) => {
    const commentNo = req.params.commentNo;
    if (!commentNo) {
        return res.status(400).json({ message: 'commentNo is required' });
    }
    try {
        const success = await commentModel.deleteComment(parseInt(commentNo));
        if (success) {
            res.status(200).json({ message: 'success' });
        } else {
            res.status(404).json({ message: 'comment not found' });
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'server error' });
    }
};

exports.addViewCount = async (req, res) => {
    const boardNo = req.params.boardNo;
    if (!boardNo) {
        return res.status(400).json({ message: 'boardNo is required' });
    }
    try {
        const updatedPost = await boardModel.addViewCount(parseInt(boardNo));
        if (updatedPost) {
            res.status(200).json({ message: 'success', data: updatedPost });
        } else {
            res.status(404).json({ message: 'Board post not found' });
        }
    } catch (error) {
        console.error('Error incrementing view count:', error);
        res.status(500).json({ message: 'server error' });
    }
};