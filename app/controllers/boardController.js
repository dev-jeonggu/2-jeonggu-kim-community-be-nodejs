const boardModel = require('../models/boardModel');

// NOTE : 게시글 전체 조회
exports.getBoardList = async (req, res) => {
    const startPage = parseInt(req.query.startPage, 10) || 1;
    const endPage = parseInt(req.query.endPage, 10) || 10;

    if (startPage <= 0 || endPage < startPage) {
        return res.status(400).json({ message: "invalid", data: null });
    }

    try {
        const boardList = await boardModel.getBoardList(startPage, endPage);
        res.status(200).json({ message: "success", data: boardList });
    } catch (error) {
        console.error('Error fetching board list:', error);
        res.status(500).json({ message: "server error", data: null });
    }
};

// NOTE : 게시글 추가
exports.addBoard = async (req, res) => {
    console.log(req.session);
    console.log(req.session.user);
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const { title, content, imageFile, imageFileName } = req.body;
    const email = req.session.user.email;
    const userNo = req.session.user.id;

    if (!title || !content || !email) {
        return res.status(400).json({ message: '필수 필드가 누락되었습니다.' });
    }

    try {
        const newPost = await boardModel.addBorad({ title, content, email, imageFile, imageFileName, userNo });
        res.status(201).json({ message: 'success', data: newPost });
    } catch (error) {
        console.error('Error adding board post:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.', data: null });
    }
};

// NOTE : 특정 게시글 조회
exports.getBoardInfo = async (req, res) => {
    const boardNo = parseInt(req.params.boardNo, 10);
    const email = req.user?.email || null;

    if (!boardNo) {
        return res.status(400).json({ message: "invalid", data: null });
    }

    try {
        const board = await boardModel.getBoardById(boardNo, email);
        if (board) {
            board.isAuthor = req.session?.user?.email === board.email;
            res.status(200).json({ message: 'success', data: board });
        } else {
            res.status(404).json({ message: 'not found', data: null });
        }
    } catch (error) {
        console.error('Error fetching board info:', error);
        res.status(500).json({ message: 'server error', data: null });
    }
};

// NOTE : 게시글 수정
exports.editBoard = async (req, res) => {
    const boardNo = parseInt(req.params.boardNo, 10);
    const { title, content, imageFile, imageFileName } = req.body;

    try {
        const editBoard = await boardModel.editBoard(boardNo, { title, content, imageFile, imageFileName });
        res.status(200).json({ message: 'success', data: editBoard });
    } catch (error) {
        console.error('Error updating board post:', error);
        res.status(500).json({ message: 'server error', data: null });
    }
};

// NOTE : 게시글 삭제
exports.deleteBoard = async (req, res) => {
    const boardNo = parseInt(req.params.boardNo, 10);

    try {
        const success = await boardModel.deleteBoard(boardNo);
        if (success) {
            res.status(200).json({ message: 'success' });
        } else {
            res.status(404).json({ message: 'Board not found' });
        }
    } catch (error) {
        console.error('Error deleting board:', error);
        res.status(500).json({ message: 'server error' });
    }
};

// NOTE : 좋아요 기능
exports.likeBoard = async (req, res) => {
    const { boardNo } = req.body;
    const userId = req.user?.id || null;

    if (!boardNo || !userId) {
        return res.status(400).json({ message: 'invalid', data: null });
    }

    try {
        const updatedBoard = await boardModel.likeBoard(boardNo, userId);
        if (updatedBoard) {
            res.status(200).json({ message: 'success', data: updatedBoard });
        } else {
            res.status(404).json({ message: 'Board not found', data: null });
        }
    } catch (error) {
        console.error('Error liking board:', error);
        res.status(500).json({ message: 'server error', data: null });
    }
};

// NOTE : 조회수 증가
exports.addViewCount = async (req, res) => {
    const boardNo = parseInt(req.params.boardNo);

    if (!boardNo) {
        return res.status(400).json({ message: 'invalid', data: null });
    }
    try {
        const updatedPost = await boardModel.addViewCount(boardNo);
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

// NOTE : 파일 업로드 처리 함수
exports.uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
    }

    const filePath = `../images/board/${req.file.filename}`;
    res.json({ message: '파일 업로드 성공', filePath });
};
