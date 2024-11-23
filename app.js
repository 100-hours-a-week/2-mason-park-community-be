const express = require('express');
require('express-async-errors')
const logger = require('./middlewares/loggingMiddleware');
const session = require('express-session');
const cors = require('cors');
const { errorHandler } = require("./middlewares/errorHandlingMiddleware");
const app = express();

// == Middleware 설정 ==

// 요청 body JSON 파싱
app.use(express.json());

// 로깅
app.use(logger);

// CORS
app.use(cors({
    origin: 'http://localhost:3000', // 허용할 출처 (default : 모든 출처 허용)
    credentials: true, // 쿠키, 인증 정보 전송 허용 여부 (default : false)
}));

// 세션
app.use(session({
    cookie: {	//세션 쿠키 설정 (세션 관리 시 클라이언트에 보내는 쿠키)
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000
    },
    secret: process.env.SESSION_SECRET_KEY,
    resave: false, // 세션에 변경사항이 없더라도 저장
    saveUninitialized: false, // 초기화되지 않은 세션도 저장
    name: 'session_id' // 세션 쿠키 이름
}));


// Route 설정
const router = require('./routes/index');
app.use('/api', router);

// 에러 핸들링
app.use('/api', errorHandler);

module.exports = app;