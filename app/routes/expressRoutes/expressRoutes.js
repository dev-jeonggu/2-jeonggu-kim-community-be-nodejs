const express = require('express');
const router = express.Router();
const expressController = require('../../controllers/expressControllers/expressControllers');

// NOTE : 사용자 목록 조회
router.get('/users', expressController.getUsers);

// NOTE : 로그인, 로그아웃
router.post('/login', (req, res, next) => {
    // NOTE : 요청이 여기까지 오는지 확인용
    // console.log("로그인 요청 수신:", req.body);
    next();
}, expressController.login);

router.post('/logout', expressController.logout);

// NOTE : 인증 미들웨어 사용
router.get('/dashboard', (req, res) => {
    res.send('<h1>Welcome to the Dashboard!</h1>'); // NOTE : 간단한 테스트 응답
});

module.exports = router;