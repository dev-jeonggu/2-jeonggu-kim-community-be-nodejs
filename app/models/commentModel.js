const pool = require('../../config/db');

// NOTE : 댓글 추가하기
exports.addComment = async ({ board_id, content, user_id }) => {
    try {
        const now =  new Date();
        const [result] = await pool.promise().query(
            `INSERT INTO comments (board_id, content, user_id, reg_dt)
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
exports.getCommentsByBoardId = async (board_id, user_id) => {
    try {
        const [comments] = await pool.promise().query(
            `SELECT
                b.board_id AS board_id
            ,   u.profile_url
            ,   u.nickname
            ,   c.comment_id AS comment_id
            ,   c.content
            ,   c.user_id
            ,   c.reg_dt
            ,   c.chg_dt
            ,   CASE WHEN c.user_id = ? THEN TRUE 
                    ELSE FALSE 
                END AS isAuthor
            ,   CASE WHEN c.chg_dt is not null THEN TRUE 
                    ELSE FALSE 
                END AS isChange
            FROM boards b
            INNER JOIN comments c ON b.board_id = c.board_id
            INNER JOIN users u ON c.user_id = u.user_id
            WHERE b.board_id = ?`,
            [user_id, board_id]
        );
        return comments;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw new Error('Failed to fetch comments');
    }
};

// NOTE : 특정 댓글 삭제하기
exports.deleteComment = async (comment_id) => {
    try {
        const [result] = await pool.promise().query(
            `DELETE FROM comments WHERE comment_id = ?`,
            [comment_id]
        );
        return result.affectedRows > 0; // NOTE : 삭제 성공 여부 반환
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw new Error('Failed to delete comment');
    }
};

// NOTE : 특정 댓글 수정하기
exports.updateComment = async (comment_id, newContent) => {
    try {
        const [result] = await pool.promise().query(
            `UPDATE comments
             SET content = ?, chg_dt = NOW()
             WHERE comment_id = ?`,
            [newContent, comment_id]
        );
        return result.affectedRows > 0; // NOTE : 수정 성공 여부 반환
    } catch (error) {
        console.error('Error updating comment:', error);
        throw new Error('Failed to update comment');
    }
};