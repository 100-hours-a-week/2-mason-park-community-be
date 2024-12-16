
exports.save = async (conn, userId, postId) => {
    const query = `INSERT INTO POST_THUMBS (user_id, post_id) VALUES (?, ?)`;

    // insertId : bigint | Number(insertId)
    return await conn.query(query, [userId, postId]);
}

exports.existsByUserIdAndPostId = async (conn, userId, postId) => {
    const query = `SELECT 1 FROM POST_THUMBS 
                    WHERE user_id = ? AND post_id = ?
                    LIMIT 1`;

    const rows = await conn.query(query, [userId, postId]);

    return rows.length > 0;
}

exports.deleteByUserIdAndPostId = async (conn, userId, postId) => {
    const query = `DELETE FROM POST_THUMBS WHERE user_id = ? AND post_id = ?`

    return await conn.query(query, [userId, postId]);
}