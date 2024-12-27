const pool = require('../../config/db');

exports.getUser = async (key, value, user_id) => {
  try {
    let sql = `SELECT user_id, nickname, email, profile_url FROM users WHERE ?? = ?`;
    const params = [key, value];

    // NOTE : user_id가 존재하면 조건 추가
    if (user_id) {
      sql += ` AND user_id != ?`;
      params.push(user_id);
    }

    // 쿼리 실행
    const [rows] = await pool.promise().query(sql, params);

    if (rows.length > 0) {
      // NOTE: 데이터가 존재할 경우 검증 실패 메시지 반환
      return {
        success: false,
        user_id: rows[0].user_id,
        nickname: rows[0].nickname,
        email: rows[0].email,
        profile_url: rows[0].profile_url,
      };
    } else {
      // NOTE: 데이터가 없을 경우 검증 성공 메시지 반환
      return { success: true };
    }
  } catch (err) {
    console.error("DB 쿼리 실행 중 오류 발생:", err);
    throw new Error("데이터베이스 요청 중 오류가 발생했습니다.");
  }
};

exports.addUser = async (email, password, nickname, profile_url) => {
    try {
        // NOTE : MySQL INSERT 쿼리 실행
        const [result] = await pool.promise().query(
            `INSERT INTO users (email, password, nickname, profile_url) VALUES (?, ?, ?, ?)`,
            [email, password, nickname, profile_url]
        );

        // NOTE : 추가된 사용자의 ID 반환
        const newUser = {
            user_id: result.insertId,
            email,
            password,
            nickname,
            profile_url,
        };

        return newUser; 
    } catch (error) {
        console.error('Error inserting user into database:', error);

        // NOTE : UNIQUE 제약 조건 위반 에러 처리
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('이미 사용 중인 이메일 또는 닉네임입니다.');
        }

        throw new Error('데이터베이스에 사용자 추가 중 오류가 발생했습니다.');
    }
};
exports.updateUser = async (user_id, updateData) => {
  try {
      // NOTE: 업데이트 데이터에서 필드 추출
      const { email, password, nickname, profile_url } = updateData;

      // NOTE: 업데이트 쿼리 실행
      const [result] = await pool.promise().query(
          `UPDATE users
           SET email = COALESCE(?, email),
               password = COALESCE(?, password),
               nickname = COALESCE(?, nickname),
               profile_url = COALESCE(?, profile_url)
           WHERE user_id = ?`,
          [email, password, nickname, profile_url, user_id]
      );

      // NOTE: 업데이트 결과 확인
      if (result.affectedRows === 0) {
          throw new Error('User not found'); // 존재하지 않는 사용자
      }

      return result;
  } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('데이터베이스에서 사용자 업데이트 중 오류가 발생했습니다.');
  }
};

// NOTE : 사용자 정보 삭제 및 관련 정보 삭제
// NOTE : 트랜잭션 적용 후
exports.deleteUser = async (user_id) => {
  const connection = await pool.promise().getConnection();
  try {
        // NOTE : (추가) : 트랜잭션 적용하기
        await connection.beginTransaction();
        const [user_result] = await pool.promise().query(
          `DELETE FROM users WHERE user_id = ?`,
          [user_id]
        );

        // NOTE : 게시글 삭제
        const [board_result] = await connection.query(
          `DELETE FROM boards WHERE user_id = ?`,
          [user_id]
        );
  
        // NOTE : 댓글 삭제
        const [comment_result] = await connection.query(
          `DELETE FROM comments WHERE user_id = ?`,
          [user_id]
        );

        await connection.commit();

        return true;
  } catch (error) {
    await connection.rollback();
      console.error('Error deleting user:', error);
      return false;

  } finally {
    // NOTE : 연결 반환
    connection.release();
  }
};