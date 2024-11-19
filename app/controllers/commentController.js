const commentModel = require('../models/commentModel');

exports.addComment = async (req, res) => {
    const { board_id, content } = req.body;
    const email = req.user?.email || null;
    const userId = req.user?.id || null;
    const nickname = req.user?.nickname || null;
    const profile_url = req.user?.profile_url || null;

    if (!board_id || !content) {
        return res.status(400).json({ message: 'Content is required' });
    }

    try {
        const result = await commentModel.addComment({ board_id, content, email, userId });
        result.nickname = nickname
        result.profile_url = profile_url
        res.status(200).json({ message: 'success', data: result });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'server error', data: null });
    }
};

exports.getCommentsByBoardId = async (req, res) => {
    const board_id = req.params.board_id;
    const user_id = req.user?.id || null;

    if (!board_id) {
        return res.status(400).json({ message: 'Content is required' });
    }

    try {
        const comments = await commentModel.getCommentsByBoardId(parseInt(board_id), user_id);

        res.status(200).json({ message: 'success', data: comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'server error', data: null });
    }
};

exports.editComment = async (req, res) => {
    const commentNo = parseInt(req.params.commentNo, 10);
    const { content } = req.body;

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
    const board_id = req.params.board_id;
    if (!board_id) {
        return res.status(400).json({ message: 'board_id is required' });
    }
    try {
        const updatedPost = await boardModel.addViewCount(parseInt(board_id));
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