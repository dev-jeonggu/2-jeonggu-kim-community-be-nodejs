const path = require('path');
const { formatDate } = require('../utils/utils'); // NOTE : utils.js에서 formatDate 가져오기
const { getJsonData, saveJsonData } = require('../utils/utils'); // NOTE : utils.js에서 formatDate 가져오기
const pool = require('../../config/db');

const boardFilePath = path.join(__dirname, '../data/boardData.json');
const userFilePath = path.join(__dirname, '../data/userData.json');
const commentFilePath = path.join(__dirname, '../data/commentData.json');

// NOTE : 특정 게시글에 대한 정보
/*
exports.getBoardById = async (boardNo, email) => {
    const jsonBoardData = await getJsonData(boardFilePath, "boards"); 
    const board = jsonBoardData.boards.find(board => board.id === boardNo);

    let jsonUserData =  await getJsonData(userFilePath, "users"); 
    jsonUserData.users = jsonUserData.users.filter(user => user.id == board.userNo); 

    if (board) {
        // NOTE : 좋아요 배열에 사용자의 이메일이 있는지 확인하고, isLike 값 설정
        const isLike = board.likes ? board.likes.includes(email) : false;
        return {
            ...board,
            likes: undefined, 
            isLike: isLike,
            profileUrl: jsonUserData.users[0].profile_url,
            nickname: jsonUserData.users[0].nickname
        };
    }

    return null;
};*/
exports.getBoardById = async (boardNo, email) => {
    try {
        const [boards] = await pool.promise().query(
            `SELECT
                b.id as board_id
            ,	b.title
            ,	b.content
            ,	b.reg_dt as date
            ,	b.reg_id as user_id
            ,	b.image_url
            ,	u.nickname
            ,	u.profile_url
            ,	( SELECT COUNT(*) FROM innodb.likes WHERE board_id = b.id )as likeCnt
            ,	( SELECT COUNT(*) FROM innodb.comments WHERE board_id = b.id )as commentCnt
            ,	( SELECT COUNT(*) FROM innodb.boardview WHERE board_id = b.id )as viewCnt
            ,	CASE WHEN EXISTS (
                    SELECT * 
                    FROM innodb.boards
                    WHERE email = ?
                    AND board_id = ?
                ) THEN TRUE 
                ELSE FALSE END as isAuthor
            FROM innodb.boards b
            INNER JOIN innodb.users u ON b.reg_id = u.id
            WHERE b.id = ?`,
            [email, boardNo, boardNo]
        );

        if (boards.length > 0) {
            return boards[0];
        }
        return null;
    } catch (error) {
        console.error('Error fetching board by ID:', error);
        throw new Error('Failed to fetch board by ID');
    }
};

// NOTE : 게시글 추가하기
/*
exports.addBorad = async ({ title, content, email, imageFile, imageFileName, userNo}) => {
    const jsonBoardData = await getJsonData(boardFilePath, "boards"); 
    const reg_dt = formatDate(new Date());
    const maxId = jsonBoardData.boards.reduce((max, board) => Math.max(max, board.id), 0);
    const newPostId = maxId + 1;
    const newPost = {
        id: newPostId,
        title,
        content,
        date: reg_dt,
        email: email,
        userNo: userNo,
        imageFile: imageFile || null, // NOTE : imageFile이 없으면 null로 설정
        imageFileName: imageFileName || null
    };
    jsonBoardData.boards.push(newPost);
    await saveJsonData(boardFilePath, jsonBoardData);
    return newPost;
};
*/
exports.addBoard = async ({ title, content, email, imageFile, imageFileName, userNo }) => {
    try {
        const [result] = await pool.promise().query(
            `INSERT INTO innodb.boards (title, content, email, userNo, imageFile, imageFileName, date)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [title, content, email, userNo, imageFile || null, imageFileName || null]
        );

        return {
            id: result.insertId,
            title,
            content,
            email,
            userNo,
            imageFile,
            imageFileName,
            date: new Date()
        };
    } catch (error) {
        console.error('Error adding board:', error);
        throw new Error('Failed to add board');
    }
};

// NOTE: 게시글 목록 가져오기
/*
exports.getBoardList = async (startPage = 1, endPage = 10) => {
    const jsonBoardData = await getJsonData(boardFilePath, "boards"); 
    const jsonUserData = await getJsonData(userFilePath, "users");
    const jsonCommentData = await getJsonData(commentFilePath, "comments");

    const startIndex = (startPage - 1) * 10;
    const endIndex = endPage * 10;
    const selectedPosts = jsonBoardData.boards.slice(startIndex, endIndex).map(board => {

        const user = jsonUserData.users.find(user => user.id === board.userNo);
        const comments = jsonCommentData.comments.filter(comment => comment.boardNo === board.id);

        return {
            boardNo: board.id,
            title: board.title,
            likeCnt: board.likeCnt || 0,
            commentCnt: comments.length,
            viewCnt: board.viewCnt || 0,
            date: board.date || formatDate(new Date()),
            nickname: user ? user.nickname : 'Unknown', // NOTE : 사용자가 있으면 nickname, 없으면 'Unknown'
            profileUrl: user ? user.profile_url : '',
            email: board.email
        };
    });

    return selectedPosts;
};*/
exports.getBoardList = async (startPage = 1, endPage = 10) => {
    const offset = (startPage - 1) * 10;
    const limit = endPage * 10;

    try {
        const [boards] = await pool.promise().query(
            `SELECT 
                b.id as board_id
            ,	b.title
            ,	b.reg_dt as date
            ,	b.reg_id as user_id
            ,	u.nickname
            ,	u.profile_url
            ,	( SELECT COUNT(*) FROM innodb.likes WHERE board_id = b.id )as likeCnt
            ,	( SELECT COUNT(*) FROM innodb.comments WHERE board_id = b.id )as commentCnt
            ,	( SELECT COUNT(*) FROM innodb.boardview WHERE board_id = b.id )as viewCnt
            FROM innodb.boards b
            INNER JOIN innodb.users u on b.reg_id = u.id`,
            // [offset, limit]
        );

        return boards;
    } catch (error) {
        console.error('Error fetching board list:', error);
        throw new Error('Failed to fetch board list');
    }
};

// NOTE : 게시글 업데이트
/*
exports.editBoard = async (boardNo, updatedData) => {
    const jsonBoardData = await getJsonData(boardFilePath, "boards"); 
    const boardIndex = jsonBoardData.boards.findIndex(board => board.id === boardNo);

    if (boardIndex === -1) {
        throw new Error('board not found');
    }

    const board = jsonBoardData.boards[boardIndex];
    // NOTE : 좋아요 배열이 없는 경우 초기화
    if (!board.likes) {
        board.likes = [];
    }

    jsonBoardData.boards[boardIndex] = { 
        ...board
        , ...updatedData
        , imageFile: updatedData.imageFile || board.imageFile
        , imageFileName: updatedData.imageFileName || board.imageFileName
     };
    await saveJsonData(boardFilePath, jsonBoardData);
    return jsonBoardData.boards[boardIndex];
};*/
exports.editBoard = async (boardNo, updatedData) => {
    try {
        const { title, content, imageFile, imageFileName } = updatedData;

        const [result] = await pool.promise().query(
            `UPDATE innodb.boards
             SET title = COALESCE(?, title),
                 content = COALESCE(?, content),
                 imageFile = COALESCE(?, imageFile),
                 imageFileName = COALESCE(?, imageFileName)
             WHERE id = ?`,
            [title, content, imageFile, imageFileName, boardNo]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error editing board:', error);
        throw new Error('Failed to edit board');
    }
};

// NOTE : 게시글 삭제
/*
exports.deleteBoard = async (boardNo) => {
    const jsonBoardData = await getJsonData(boardFilePath, "boards"); 
    const jsonCommentData = await getJsonData(commentFilePath, "comments");

    // NOTE : 삭제할 게시글을 찾기
    const boardIndex = jsonBoardData.boards.findIndex(board => board.id === boardNo);
    
    if (boardIndex !== -1) {
        // NOTE : 게시글 삭제
        jsonBoardData.boards.splice(boardIndex, 1); 
        await saveJsonData(boardFilePath, jsonBoardData);

        // NOTE : 해당 게시글과 관련된 댓글 삭제
        jsonCommentData.comments = jsonCommentData.comments.filter(comment => comment.boardNo !== boardNo);
        await saveJsonData(commentFilePath, jsonCommentData);
        
        return true;
    }
    return false; // 해당 게시글이 없을 경우
};
*/
exports.deleteBoard = async (boardNo) => {
    try {
        const [result] = await pool.promise().query(
            `DELETE FROM boards WHERE id = ?`,
            [boardNo]
        );

        if (result.affectedRows > 0) {
            // 게시글과 관련된 댓글 삭제
            await pool.promise().query(
                `DELETE FROM innodb.comments WHERE boardNo = ?`,
                [boardNo]
            );
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting board:', error);
        throw new Error('Failed to delete board');
    }
};
// NOTE : 조회수 증가하기
/*
exports.addViewCount = async (boardNo) => {
    const jsonBoardData = await getJsonData(boardFilePath, "boards"); 

    const boardIndex = jsonBoardData.boards.findIndex(board => board.id === boardNo);

    if (boardIndex !== -1) {
        jsonBoardData.boards[boardIndex].viewCnt = (jsonBoardData.boards[boardIndex].viewCnt || 0) + 1;
        await saveJsonData(boardFilePath, jsonBoardData);
        return jsonBoardData.boards[boardIndex];
    }
    return null; // NOTE : 게시글이 없을 경우 null 반환
};*/
exports.addViewCount = async (boardNo) => {
    try {
        const [result] = await pool.promise().query(
            `UPDATE innodb.boards SET viewCnt = viewCnt + 1 WHERE id = ?`,
            [boardNo]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error incrementing view count:', error);
        throw new Error('Failed to increment view count');
    }
};

// NOTE : 좋아요 누르기
/*
exports.likeBoard = async (boardNo, email) => {
    const jsonBoardData = await getJsonData(boardFilePath, "boards"); 
    const boardIndex = jsonBoardData.boards.findIndex(board => board.id === boardNo);

    if (boardIndex !== -1) {
        const board = jsonBoardData.boards[boardIndex];
        
        // NOTE : 좋아요 누른 사용자 확인 (중복 방지)
        if (!board.likes) board.likes = []; // lNOTE : ikes 필드가 없으면 배열 초기화
        
        if (board.likes.includes(email)) {
            board.likes = board.likes.filter(email => email !== email);
            board.likeCnt = (board.likeCnt || 1) - 1;
        } else {
            // NOTE : 좋아요 추가
            board.likes.push(email);
            board.likeCnt = (board.likeCnt || 0) + 1;
        }

        await saveJsonData(boardFilePath, jsonBoardData);
        return { likeCnt: board.likeCnt };
    }
    return null; // NOTE : 게시글이 없을 경우 null 반환
};
*/
exports.likeBoard = async (boardNo, userId) => {
    try {
        // 게시글 존재 여부 확인
        const [rows] = await pool.promise().query("SELECT * FROM innodb.boards WHERE id = ?", [boardNo]);
        if (rows.length === 0) {
            return null; // NOTE : 게시글이 없으면 null 반환
        }

        // NOTE : 사용자가 이미 좋아요를 눌렀는지 확인
        const [existingLike] = await pool.promise().query(
            "SELECT id FROM innodb.likes WHERE board_id = ? AND user_id = ?",
            [boardNo, userId]
        );

        if (existingLike.length > 0) {
            // NOTE : 이미 좋아요를 눌렀다면 좋아요 취소
            await pool.promise().query("DELETE FROM innodb.likes WHERE board_id = ? AND user_id = ?", [boardNo, userId]);
            const [updatedBoard] = await pool.promise().query("SELECT count(*) as likeCnt FROM innodb.likes WHERE board_id = ?", [boardNo]);
            return { likeCnt: updatedBoard[0].likeCnt, liked: false };
        } else {
            // NOTE : 좋아요 추가
            await pool.promise().query(
                "INSERT INTO innodb.likes (board_id, user_id, reg_dt) VALUES (?, ?, NOW())",
                [boardNo, userId]
            );
            const [updatedBoard] = await pool.promise().query("SELECT count(*) as likeCnt FROM innodb.likes WHERE board_id = ?", [boardNo]);
            return { likeCnt: updatedBoard[0].likeCnt, liked: true };
        }
    } catch (error) {
        console.error("Error in likeBoard:", error);
        throw error;
    }
};
