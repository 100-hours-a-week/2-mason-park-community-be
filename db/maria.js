const maria = require('mariadb')

const pool = maria.createPool({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
})

pool.getConnection()
    .then(() => {
        console.log('커넥션 풀 상태 양호');
    })
    .catch(error => {
        console.error('커넥션 풀 상태 오류:', error);
    });

module.exports = pool;

