const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const expressRoutes = require('./app/routes/expressRoutes/expressRoutes');

// NOTE : authRoutes와 isAuthenticated 임포트
const { router: authRoutes, isAuthenticated } = require('./app/routes/authRoutes');
const userRoutes = require('./app/routes/userRoutes');
const boardRoutes = require('./app/routes/boardRoutes');
const commentRoutes = require('./app/routes/commentRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4444;

// NOTE : 특정 도메인만 허용 (예: 'http://localhost:3000'에서 요청 허용)
app.options('*', cors());

app.use(cors({
    /// 3000: re, 5555 : fe
    origin: ['http://localhost:3000', 'http://localhost:5555'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // NOTE : 허용할 메서드 지정
    credentials: true // NOTE : 세션 쿠키 전송을 허용
}));

// NOTE : 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'app', 'views')));
app.use(helmet()); // NOTE : Helmet을 사용하여 보안 설정
app.use(cookieParser());

app.use('/images', express.static(path.join(__dirname, 'images')));

// NOTE : 요청 속도 제한 설정
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

// NOTE : Helmet을 사용한 Content Security Policy
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://trusted.com"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "https://images.com"],
    }
}));

// NOTE : 사용자 관련
//app.use('/api/users', expressRoutes);
app.use('/api', expressRoutes);
app.post('/login', expressRoutes);
app.get('/dashboard', expressRoutes);

// NOTE : 커뮤니티 관련
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/boards', boardRoutes);
app.use('/comments', commentRoutes);
app.use('/images', express.static(path.join(__dirname, 'app/images')));
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message, data: null });
});


// app.get('/helloworld', (req, res) => {
//     res.sendFile(path.join(__dirname, 'app/views/helloworld.html'));
// });

app.use(express.static(path.join(__dirname, 'resources')));
app.use('/css', express.static(path.join(__dirname, 'resources/css')));

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'app/views/login.html'));
// });
// // NOTE : 회원 가입
// app.get('/register', (req, res) => {
//     res.sendFile(path.join(__dirname, 'app/views/register.html'));
// });
// // NOTE : 로그인
// app.get('/login', (req, res) => {
//     res.sendFile(path.join(__dirname, 'app/views/login.html'));
// });
// // NOTE : 게시판 리스트
// app.get('/board', (req, res) => {
//     res.sendFile(path.join(__dirname, 'app/views/board/board.html'));
// });
// //NOTE : 게시판 상세 
// app.get('/boardInfo', (req, res) => {
//     res.sendFile(path.join(__dirname, 'app/views/board/boardInfo.html'));
// });
// // NOTE : 게시판 수정
// app.get('/boardEdit', (req, res) => {
//     res.sendFile(path.join(__dirname, 'app/views/board/boardEdit.html'));
// });
// // NOTE : 게시판 추가
// app.get('/boardAdd', (req, res) => {
//     res.sendFile(path.join(__dirname, 'app/views/board/boardAdd.html'));
// });
// // NOTE : 회원 수정
// app.get('/userEdit', (req, res) => {
//     res.sendFile(path.join(__dirname, 'app/views/user/userEdit.html'));
// });

// NOTE : 데이터베이스 연결
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'admin!123',
//     database: 'test'
// });

// db.connect(err => {
//     if (err) {
//         console.error('DB 연결 실패: ' + err.stack);
//         return;
//     }
//     console.log('DB 연결 성공!');
// });

// NOTE : 서버시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


