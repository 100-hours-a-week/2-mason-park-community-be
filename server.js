const dotenv = require('dotenv');
dotenv.config();

if (process.env.NODE_ENV === 'production') {
    require('dotenv').config({ path: `./config/.env`});
}

const app = require('./app');

const PORT = process.env.PORT || 8080;
let isKeepAlive = false;

const pool = require('./db/maria');
const crypto = require("crypto-js");
const redisClient = require("./db/redis");

app.listen(PORT, () => {
    isKeepAlive = true;
    if (process.send) {
        process.send('ready');
    }
    console.log(`API Server is running on port ${PORT}`);

    pool.getConnection()
        .then(async (conn) => {
            console.log('Maria DB : 커넥션 풀 상태 양호');
            await createAdmin(conn);
        })
        .catch(error => {
            console.error('Maria DB : 커넥션 풀 상태 오류:', error);
        });

    redisClient.connect()
        .then(() => console.log("Redis : 연결 성공"))
        .catch((err) => console.error("Redis : 연결 실패", err));
})

process.on('SIGINT', () => {
    app.close(() => {
        console.log('server closed');
        if (process.exit) {
            process.exit(0);
        }
    })
})

const createAdmin = async (conn) => {
    console.log('어드민 계정 생성 중...');

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const role = 'ADMIN';
    const nickname = '방장';
    if (!email || !password) {
        console.log('어드민 계정 정보가 환경변수에 설정되지 않았습니다');
        return;
    }

    // 어드민 계정이 이미 있는지 확인
    const rows = await conn.query(`SELECT 1 FROM USERS WHERE email = ? LIMIT 1`, [email]);
    if (rows.length > 0) {
        console.log('어드민 계정이 이미 존재합니다.');
        return;
    }

    const encryptedPassword = crypto.AES.encrypt(password, process.env.CRYPTO_SECRET_KEY).toString();

    // 어드민 계정 생성
    await conn.query(
        `INSERT INTO USERS (email, password, nickname, role) VALUES (?, ?, ?, ?)`,
        [email, encryptedPassword, nickname, role]
    );

    console.log('어드민 계정 생성 완료...');
}