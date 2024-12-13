const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
// NOTE : authRoutes와 isAuthenticated 임포트
const authRoutes = require('./app/routes/authRoutes');
const userRoutes = require('./app/routes/userRoutes');
const boardRoutes = require('./app/routes/boardRoutes');
const commentRoutes = require('./app/routes/commentRoutes');
const commonRoutes = require('./app/routes/commonRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// NOTE : 특정 도메인만 허용 (예: 'http://localhost:3000'에서 요청 허용)
app.options('*', cors());

app.use(cors({
    /// 3000: re, 5555 : fe
    origin: ['http://localhost:3000', 'http://localhost:5555', process.env.FRONT_URL, process.env.DOCKER_URL],
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

// NOTE : Helmet을 사용한 Content Security Policy
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://trusted.com"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "https://images.com"],
    }
}));

// NOTE : server에서 에러나서 추가
app.use((req, res, next) => {
    res.removeHeader("Cross-Origin-Opener-Policy");
    next();
});


// NOTE : 커뮤니티 관련
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/boards', boardRoutes);
app.use('/comments', commentRoutes);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/images', commonRoutes);
//app.use('/images', express.static(path.join(__dirname, 'app/images')));
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message, data: null });
});

app.use(express.static(path.join(__dirname, 'resources')));
app.use('/css', express.static(path.join(__dirname, 'resources/css')));

// NOTE : 서버시작
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


