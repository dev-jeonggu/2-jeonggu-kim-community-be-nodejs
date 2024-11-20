const commentModel = require('../models/commentModel');

// NOTE: 댓글 추가
exports.addComment = async (req, res) => {
    const { board_id, content } = req.body;
    const email = req.user?.email || null;
    const user_id = req.user?.user_id || null;
    const nickname = req.user?.nickname || null;
    const profile_url = req.user?.profile_url || null;

    if (!board_id || !content) {
        return res.status(400).json({ message: 'Content is required' });
    }

    try {
        const result = await commentModel.addComment({ board_id, content, email, user_id });
        result.nickname = nickname
        result.profile_url = profile_url
        return res.status(200).json({ message: 'success', data: result });
    } catch (error) {
        console.error('Error adding comment:', error);
        return res.status(500).json({ message: 'server error', data: null });
    }
};

// NOTE: 특정 댓글 가져오기
exports.getCommentsByBoardId = async (req, res) => {
    const board_id = req.params.board_id;
    const user_id = req.user?.user_id || null;

    if (!board_id) {
        return res.status(400).json({ message: 'Content is required' });
    }

    try {
        const comments = await commentModel.getCommentsByBoardId(parseInt(board_id), user_id);

        return res.status(200).json({ message: 'success', data: comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return res.status(500).json({ message: 'server error', data: null });
    }
};

// NOTE: 댓글 수정
exports.editComment = async (req, res) => {
    const comment_id = parseInt(req.params.comment_id, 10);
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Content is required' });
    }

    try {
        const success = await commentModel.updateComment(comment_id, content);
        if (success) {
            return res.status(200).json({ message: 'success' });
        } else {
            return res.status(404).json({ message: 'comment not found' });
        }
    } catch (error) {
        console.error('Error updating comment:', error);
        return res.status(500).json({ message: 'server error' });
    }
};

// NOTE: 댓글 삭제
exports.deleteComment = async (req, res) => {
    const comment_id = req.params.comment_id;
    if (!comment_id) {
        return res.status(400).json({ message: 'comment_id is required' });
    }
    try {
        const success = await commentModel.deleteComment(parseInt(comment_id));
        if (success) {
            return res.status(200).json({ message: 'success' });
        } else {
            return res.status(404).json({ message: 'comment not found' });
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({ message: 'server error' });
    }
};

// NOTE: 조회수 증가
exports.addViewCount = async (req, res) => {
    const board_id = req.params.board_id;
    if (!board_id) {
        return res.status(400).json({ message: 'board_id is required' });
    }
    try {
        const updatedPost = await boardModel.addViewCount(parseInt(board_id));
        if (updatedPost) {
            return res.status(200).json({ message: 'success', data: updatedPost });
        } else {
            return res.status(404).json({ message: 'Board post not found' });
        }
    } catch (error) {
        console.error('Error incrementing view count:', error);
        return res.status(500).json({ message: 'server error' });
    }
};