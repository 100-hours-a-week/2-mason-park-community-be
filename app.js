const express = require('express');
const session = require("express-session");

const app = express();

// == Middleware 설정 ==

// 요청 body JSON 파싱
app.use(express.json());

// CORS


// 세션
app.use(session({
    cookie: {	//세션 쿠키 설정 (세션 관리 시 클라이언트에 보내는 쿠키)
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000
    },
    secret: process.env.SESSION_SECRET_KEY,
    resave: false, // 세션을 언제나 저장할지 설정함
    saveUninitialized: false, // 세션에 저장할 내역이 없더라도 처음부터 세션을 생성할지 설정
    name: 'session_id' // 세션 쿠키 이름
}));

// 에러 핸들링
app.use('/api', (err, req, res, next) => {
    console.error('Error Message:', err.message);
    console.error('Stack Trace:', err.stack);

    // 에러 응답 전송
    res.status(500).json({ message: 'Internal Server Error' });
});

// Route 설정
const router = require('./routes/index');
app.use('/api', router);

module.exports = app;