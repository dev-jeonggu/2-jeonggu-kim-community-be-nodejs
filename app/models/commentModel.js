const fs = require('fs').promises;
const path = require('path');
const pool = require('../../config/db');

// const commentFilePath = path.join(__dirname, '../data/commentData.json');
// const boardFilePath = path.join(__dirname, '../data/boardData.json');
// const userFilePath = path.join(__dirname, '../data/userData.json');
// const { formatDate } = require('../utils/utils'); // NOTE : utils.js에서 formatDate 가져오기
// const { getJsonData, saveJsonData } = require('../utils/utils'); // NOTE : utils.js에서 formatDate 가져오기

// NOTE : JSON 파일에서 데이터 불러오기
// const getJsonCommentData = async () => {
//     let jsonData;

//     try {
//         // NOTE : 파일 읽기 시도
//         const data = await fs.readFile(commentFilePath, 'utf-8');
//         jsonData = JSON.parse(data);
//     } catch (error) {
//         // NOTE : 파일이 없거나 JSON 파싱 오류 시 초기화
//         console.error("파일을 읽거나 JSON을 파싱하는 중 오류가 발생했습니다:", error);
//         jsonData = { comments: [] }; // NOTE : 기본 구조 생성
//     }

//     if (!jsonData.comments) {
//         jsonData.comments = [];
//     }
//     return jsonData;
// };

// NOTE : JSON 파일에 데이터 저장하기
// const saveJsonCommentData = async (data) => {
//     try {
//         await fs.writeFile(commentFilePath, JSON.stringify(data, null, 2));
//     } catch (error) {
//         console.error("Error saving JSON data:", error);
//     }
// };


// NOTE : 댓글 추가하기
/*
exports.addComment = async ({ board_id, content, email, user_id}) => {
    const jsonCommentData = await getJsonData(commentFilePath, "comments");
    const jsonUserData = await getJsonData(userFilePath, "users");
    
    const maxId = jsonCommentData.comments.reduce((max, comment) => Math.max(max, comment.id), 0);
    const newCommentId = maxId + 1;
    const commentCnt = jsonCommentData.comments.filter(comment => comment.board_id === board_id);
    const newComment = {
        id: newCommentId,
        board_id,
        content,
        email,
        user_id: user_id,
        commentCnt: commentCnt.length + 1,
        date: formatDate(new Date()),
    };

    jsonCommentData.comments.push(newComment);
    await saveJsonData(commentFilePath, jsonCommentData);

    const user = jsonUserData.users.find(user => user.id === user_id);

    return {
        ...newComment,
        profile_url: user ? user.profile_url : null // 사용자가 없을 경우 null 처리
    };
};*/
exports.addComment = async ({ board_id, content, user_id }) => {
    try {
        const now =  new Date();
        const [result] = await pool.promise().query(
            `INSERT INTO innodb.comments (board_id, content, reg_id, reg_dt)
             VALUES (?, ?, ?, ?)`,
            [board_id, content, user_id, now]
        );

        return {
            comment_id: result.insertId
        ,   board_id: board_id
        ,   content
        ,   user_id: user_id
        ,   date: now
        };
    } catch (error) {
        console.error('Error adding comment:', error);
        throw new Error('Failed to add comment');
    }
};

// NOTE : 특정 게시글의 댓글 가져오기
/*
exports.getCommentsByBoardId = async (board_id) => {
    const jsonCommentData = await getJsonData(commentFilePath, "comments");
    const jsonUserData = await getJsonData(userFilePath, "users");

    // NOTE : 해당 게시글의 댓글 필터링 및 사용자 정보 추가
    const commentsWithProfile = jsonCommentData.comments
        .filter(comment => comment.board_id === board_id)
        .map(comment => {
            // NOTE : 댓글의 user_id에 해당하는 사용자 찾기
            const user = jsonUserData.users.find(user => user.id === comment.user_id);
            // NOTE : profile_url 값 추가
            return {
                ...comment,
                profile_url: user ? user.profile_url : null // 사용자가 없을 경우 null 처리
            };
        });

    return commentsWithProfile;
};*/
exports.getCommentsByBoardId = async (board_id, user_id) => {
    try {
        const [comments] = await pool.promise().query(
            `SELECT
                b.id AS board_id
            ,   u.profile_url
            ,   u.nickname
            ,   c.id AS comment_id
            ,   c.content
            ,   c.reg_id
            ,   c.reg_dt
            ,   CASE WHEN c.reg_id = ? THEN TRUE 
                    ELSE FALSE 
                END AS isAuthor
            FROM innodb.boards b
            INNER JOIN innodb.comments c ON b.id = c.board_id
            INNER JOIN innodb.users u ON c.reg_id = u.id
            WHERE b.id = ?`,
            [user_id, board_id]
        );
        return comments;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw new Error('Failed to fetch comments');
    }
};

// NOTE : 특정 댓글 삭제하기
/*
exports.deleteComment = async (comment_id) => {
    const jsonData = await getJsonData(commentFilePath, "comments");
    const initialLength = jsonData.comments.length;
    jsonData.comments = jsonData.comments.filter(comment => comment.id !== comment_id);

    if (jsonData.comments.length < initialLength) {
        await saveJsonData(commentFilePath, jsonData);
        return true;
    }
    return false;
};
*/
exports.deleteComment = async (comment_id) => {
    try {
        const [result] = await pool.promise().query(
            `DELETE FROM innodb.comments WHERE id = ?`,
            [comment_id]
        );
        return result.affectedRows > 0; // 삭제 성공 여부 반환
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw new Error('Failed to delete comment');
    }
};

// NOTE : 특정 댓글 수정하기
/*
exports.updateComment = async (comment_id, newContent) => {
    const jsonData = await getJsonData(commentFilePath, "comments");
    const commentIndex = jsonData.comments.findIndex(comment => comment.id === comment_id);
    if (commentIndex !== -1) {
        jsonData.comments[commentIndex].content = newContent;
        jsonData.comments[commentIndex].date = formatDate(new Date());
        await saveJsonData(commentFilePath, jsonData);
        return true;
    }
    return false;
};
*/
exports.updateComment = async (comment_id, newContent) => {
    try {
        const [result] = await pool.promise().query(
            `UPDATE innodb.comments
             SET content = ?, chg_dt = NOW()
             WHERE id = ?`,
            [newContent, comment_id]
        );
        return result.affectedRows > 0; // 수정 성공 여부 반환
    } catch (error) {
        console.error('Error updating comment:', error);
        throw new Error('Failed to update comment');
    }
};