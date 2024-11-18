const path = require('path');
const { getJsonData } = require('../utils/utils'); // NOTE : utils.js에서 formatDate 가져오기
const userFilePath = path.join(__dirname, '../data/userData.json');
const pool = require('../../config/db');

// async function login(email, password){
//     const jsonUserData = await getJsonData(userFilePath, "users"); 
//     const filteredUsers = jsonUserData.users.filter(user => user["email"] === email && user["password"] === password);
    
//     if (filteredUsers.length > 0) {
//         // NOTE : 데이터가 존재할 경우 검증 성공 메시지 반환
//         return {
//             success: true,
//             message: "로그인에 성공하였습니다.",
//             id: filteredUsers[0].id,
//             email: filteredUsers[0].email
//         };
//     } else {
//         // NOTE : 데이터가 없을 경우: 검증 실패 메시지 반환
//         return {
//             success: false,
//             message: "로그인에 실패하였습니다."
//         };
//     }
// }

async function login(email, password){
    try {
        // NOTE: MySQL 쿼리를 실행하여 조건에 맞는 사용자 데이터를 가져옴
        const [rows] = await pool.promise().query(
            `SELECT id, nickname, email, profile_url FROM innodb.users WHERE email = ? AND password = ?`,
            [email, password]
        );
        
        if (rows.length > 0) {
            // NOTE: 데이터가 존재할 경우 검증 실패 메시지 반환
            return {
                success: true,
                message: "로그인에 성공하였습니다.",
                id: rows[0].id,
                email: rows[0].email
            };
        } else {
            // NOTE: 데이터가 없을 경우 검증 성공 메시지 반환
            return {
                success: false,
                message: "로그인에 실패하였습니다."
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