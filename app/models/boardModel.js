const pool = require('../../config/db');

exports.getBoardById = async (board_id, email, user_id) => {
    try {
        const [boards] = await pool.promise().query(
            `SELECT
                b.board_id AS board_id
            ,	b.title
            ,	b.content
            ,	b.reg_dt AS date
            ,	b.user_id AS user_id
            ,	b.image_url
            ,   u.email
            ,	u.nickname
            ,	u.profile_url
            ,	( SELECT COUNT(*) FROM innodb.likes WHERE board_id = b.board_id )as like_cnt
            ,	( SELECT COUNT(*) FROM innodb.comments WHERE board_id = b.board_id )as comment_cnt
            ,	( SELECT COUNT(*) FROM innodb.boardview WHERE board_id = b.board_id )as view_cnt
            ,	CASE WHEN EXISTS (
                    SELECT * 
                    FROM innodb.boards
                    WHERE user_id = ?
                ) THEN TRUE 
                ELSE FALSE END AS isAuthor
            FROM innodb.boards b
            INNER JOIN innodb.users u ON b.user_id = u.user_id
            WHERE b.board_id = ?`,
            [user_id, board_id]
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
exports.addBoard = async ({ title, content, email, image_nm, image_url, user_id }) => {
    try {
        const [result] = await pool.promise().query(
            `INSERT INTO innodb.boards (title, content, user_id, image_nm, image_url, reg_dt)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [title, content, user_id, image_nm || null, image_url || null]
        );

        return {
            user_id: result.insertId,
            title,
            content,
            email,
            user_id,
            image_nm,
            image_url,
            date: new Date()
        };
    } catch (error) {
        console.error('Error adding board:', error);
        throw new Error('Failed to add board');
    }
};

// NOTE: 게시글 목록 가져오기
exports.getBoardList = async (startPage = 1, endPage = 10, searchKey, searchValue) => {
    const offset = (startPage - 1) * 10;
    const limit = endPage * 10;
    const where = searchKey && searchValue ? `WHERE ${searchKey} LIKE ?` : '';

    let query = `
        SELECT 
            b.board_id AS board_id
        ,	b.title
        ,   b.content
        ,	b.reg_dt AS date
        ,	b.user_id AS user_id
        ,	u.nickname
        ,	u.profile_url
        ,	( SELECT COUNT(*) FROM innodb.likes WHERE board_id = b.board_id ) AS like_cnt
        ,	( SELECT COUNT(*) FROM innodb.comments WHERE board_id = b.board_id ) AS comment_cnt
        ,	( SELECT COUNT(*) FROM innodb.boardview WHERE board_id = b.board_id ) AS view_cnt
        FROM innodb.boards b
        INNER JOIN innodb.users u ON b.user_id = u.user_id
        ${where}
        ORDER BY b.reg_dt desc`;
    ;
    
    try {
        const params = searchKey && searchValue 
        ? [`%${searchValue}%`] 
        : [];

        const [boards] = await pool.promise().query(query, params);

        return boards;
    } catch (error) {
        console.error('Error fetching board list:', error);
        throw new Error('Failed to fetch board list');
    }
};

// NOTE : 게시글 업데이트
exports.editBoard = async (boardId, updatedData) => {
    try {
        const fields = ["title", "content", "image_url", "image_nm"];
        const updates = [];
        const params = [];
        fields.forEach(field => {
            if (updatedData[field] && updatedData[field] !== "") {
                updates.push(`${field} = ?`);
                params.push(updatedData[field]);
            }
        });
        if (updates.length === 0) {
            throw new Error("No fields to update");
        }

        // NOTE : WHERE 조건 추가
        params.push(boardId);

        const query = `
            UPDATE innodb.boards
            SET ${updates.join(", ")}
            WHERE board_id = ?;
        `;
        const [result] = await pool.promise().query(query, params);

        if (result.affectedRows === 0) {
            throw new Error("No rows updated");
        }

        return result;

    } catch (error) {
        console.error('Error editing board:', error);
        throw new Error('Failed to edit board');
    }
};


// NOTE : 게시글 삭제
exports.deleteBoard = async (board_id) => {
    try {
        const [result] = await pool.promise().query(
            `DELETE FROM boards WHERE board_id = ?`,
            [board_id]
        );

        if (result.affectedRows > 0) {
            // NOTE : 게시글과 관련된 댓글 삭제
            await pool.promise().query(
                `DELETE FROM innodb.comments WHERE board_id = ?`,
                [board_id]
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
exports.addViewCount = async (board_id, user_id) => {
    try {
        const [result] = await pool.promise().query(
            "INSERT INTO innodb.boardview (board_id, user_id, reg_dt) VALUES (?, ?, NOW())",
            [board_id, user_id]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error incrementing view count:', error);
        throw new Error('Failed to increment view count');
    }
};

// NOTE : 좋아요 누르기
exports.likeBoard = async (board_id, user_id) => {
    try {
        // NOTE : 게시글 존재 여부 확인
        const [rows] = await pool.promise().query("SELECT * FROM innodb.boards WHERE board_id = ?", [board_id]);
        if (rows.length === 0) {
            return null; // NOTE : 게시글이 없으면 null 반환
        }

        // NOTE : 사용자가 이미 좋아요를 눌렀는지 확인
        const [existingLike] = await pool.promise().query(
            "SELECT like_id FROM innodb.likes WHERE board_id = ? AND user_id = ?",
            [board_id, user_id]
        );

        if (existingLike.length > 0) {
            // NOTE : 이미 좋아요를 눌렀다면 좋아요 취소
            await pool.promise().query("DELETE FROM innodb.likes WHERE board_id = ? AND user_id = ?", [board_id, user_id]);
            const [updatedBoard] = await pool.promise().query("SELECT count(*) AS like_cnt FROM innodb.likes WHERE board_id = ?", [board_id]);
            return { like_cnt: updatedBoard[0].like_cnt, liked: false };
        } else {
            // NOTE : 좋아요 추가
            await pool.promise().query(
                "INSERT INTO innodb.likes (board_id, user_id, reg_dt) VALUES (?, ?, NOW())",
                [board_id, user_id]
            );
            const [updatedBoard] = await pool.promise().query("SELECT count(*) AS like_cnt FROM innodb.likes WHERE board_id = ?", [board_id]);
            return { like_cnt: updatedBoard[0].like_cnt, liked: true };
        }
    } catch (error) {
        console.error("Error in likeBoard:", error);
        throw error;
    }
};
