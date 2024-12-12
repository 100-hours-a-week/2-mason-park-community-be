const pool = require('./maria')

const transaction = async (callback) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // 트랜잭션 시작
        await conn.beginTransaction();

        const result = await callback(conn);

        // 작업이 성공적으로 완료될 경우 커밋
        await conn.commit();

        return result;
    } catch (e) {
        // 작업이 실패할 경우
        if (conn) await conn.rollback();
        throw e;
    } finally {
        if (conn) await conn.release();
    }
}

module.exports = transaction;