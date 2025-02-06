const { createClient } = require("redis");

// Redis 클라이언트 생성
const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    }
});

module.exports = redisClient;