const { validatePassword } = require('../utils/utils'); // NOTE : utils.js에서 formatDate 가져오기
const pool = require('../../config/db');

async function login(email, password){
    try {
        // NOTE: MySQL 쿼리를 실행하여 조건에 맞는 사용자 데이터를 가져옴
        const [rows] = await pool.promise().query(
            `SELECT user_id, nickname, password, email, profile_url FROM innodb.users WHERE email = ?`,
            [email]
        );
        
        if (rows.length > 0) {
            const validate = await validatePassword(password, rows[0].password);
            if(validate) {
                return {
                    success: true,
                    message: "로그인에 성공하였습니다.",
                    user_id: rows[0].user_id,
                    email: rows[0].email,
                    nickname: rows[0].nickname,
                    profile_url: rows[0].profile_url
                };
            } else {
                return {
                    success: false,
                    message: "비밀번호가 틀렸습니다."
                };
            }
            // NOTE: 데이터가 존재할 경우 검증 실패 메시지 반환
        } else {
            // NOTE: 데이터가 없을 경우 검증 성공 메시지 반환
            return {
                success: false,
                message: "존재하지 않는 아이디입니다."
            };
        }
        } catch (err) {
            console.error('DB 쿼리 실행 중 오류 발생:', err);
            throw new Error('데이터베이스 요청 중 오류가 발생했습니다.');
        }
}
module.exports = {
    login
  };