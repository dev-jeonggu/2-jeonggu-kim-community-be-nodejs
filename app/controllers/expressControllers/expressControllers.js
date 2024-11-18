const mysql = require('mysql2');

// NOTE : 사용자 로그인
exports.login = (req, res) => {
    // NOTE : req.body가 제대로 수신되는지 확인
    // console.log("Received Request Body:", req.body);

    const { email, password } = req.body;
    const query = 'SELECT * FROM test.users WHERE email = ? and password = ?';

    db.execute(query, [email, password], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        if (results.length > 0) {
            return res.status(200).json({ message: 'Login successful.' });
        } else {
            return res.status(400).json({ message: 'Login Fail.' });
        }
    });
};

// NOTE : 데이터베이스에서 사용자 목록 조회
exports.getUsers = (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
};

// NOTE : 대시보드
exports.dashboard = (req, res) => {
    res.json({ message: `Welcome, ${req.session.user.username}!` });
};

// NOTE: 로그아웃
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: 'Logout failed' });
        res.json({ message: 'Logged out successfully' });
    });
};

// NOTE : 인증 미들웨어
exports.authMiddleware = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(400).json({ message: 'Unauthorized access' });
    }
};