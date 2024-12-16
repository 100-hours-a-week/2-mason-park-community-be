const moment = require('moment');

exports.save = async (conn, content, userId, postId) => {
    const query = `INSERT INTO COMMENTS (content, user_id, post_id) VALUES (?, ?, ?)`

    return await conn.query(query, [content, userId, postId]);
}

/* 댓글 유효성 검사 */
exports.findById = async (conn, commentId) => {
    const query = `SELECT FROM COMMENTS WHERE comment_id = ?`

    return await conn.query(query, [commentId]);
}

/* 댓글 목록 조회 */
exports.findAllByPostId = async (conn, postId) => {
    const query = `SELECT 
                     c.comment_id,
                     c.content,
                     c.created_at,
                     u.user_id,
                     u.nickname,
                     u.profile_image
                    FROM COMMENTS AS c
                    JOIN USERS AS u ON c.user_id = u.user_id
                    WHERE c.post_id = ?`

    const rows = await conn.query(query, [postId]);

    return rows.map(row => ({
        comment_id: row.comment_id,
        content: row.content,
        created_at: moment(row.created_at).format('YYYY-MM-DD HH:mm:ss'),
        user: {
            user_id: row.user_id,
            nickname: row.nickname,
            profile_image: row.profile_image,
        }
    }))
}

exports.update = async (conn, content, commentId) => {
    const query = `UPDATE COMMENTS SET
                    content = ?
                   WHERE comment_id = ?
    `;

    return await conn.query(query, [content, commentId]);
}

exports.deleteById = async (conn, commentId) => {
    const query = `DELETE FROM COMMENTS WHERE comment_id = ?`

    return await conn.query(query, [commentId]);
}