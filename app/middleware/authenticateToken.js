const jwt = require("jsonwebtoken");

// NOTE: JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // NOTE : Authorization 헤더에서 토큰 가져오기
  const token = authHeader && authHeader.split(" ")[1]; // NOTE : "Bearer <token>" 형식에서 토큰만 추출

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" }); // NOTE : 토큰이 없으면 401 반환
  }

  jwt.verify(token, "your_secret_key", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" }); // NOTE : 유효하지 않은 토큰이면 403 반환
    }

    req.user = user; // NOTE : 사용자 정보를 req.user에 저장
    next(); // NOTE : 다음 미들웨어 또는 라우트로 이동
  });
};

module.exports = authenticateToken;
