exports.save = async (conn, email, password, nickname, profile_image) => {
    const query = `INSERT INTO USERS (email, password, nickname, profile_image) VALUES (?, ?, ?, ?)`;

    // insertId : bigint | Number(insertId)
    return await conn.query(query, [email, password, nickname, profile_image]);
}

exports.existsEmail = async (conn, email) => {
    const query = `SELECT 1 FROM USERS WHERE email = ? LIMIT 1`;

    const rows = await conn.query(query, [email]);

    return rows.length > 0;
}

exports.existsNickname = async (conn, nickname) => {
    const query = `SELECT 1 FROM USERS WHERE nickname = ? LIMIT 1`;

    const rows = await conn.query(query, [nickname]);

    return rows.length > 0;
}

exports.findByEmail = async (conn, email) => {
    const query = `SELECT * FROM USERS WHERE email = ?`;

    const [row] = await conn.query(query, [email]);

    return row; // User Object | undefined
}

exports.findById = async (conn, userId) => {
    const query = `SELECT * FROM USERS WHERE user_id = ?`;

    const [row] = await conn.query(query, [userId]);

    return row; // User Object | undefined
}

exports.updateProfile = async (conn, nickname, profile_image, userId) => {
    const query = `UPDATE USERS SET nickname = ?, profile_image = ? WHERE user_id = ?`;

    return await conn.query(query, [nickname, profile_image, userId]);
}

exports.updatePassword = async (conn, password, userId) => {
    const query = `UPDATE USERS SET password = ? WHERE user_id = ?`;

    return await conn.query(query, [password, userId]);
}

exports.deleteById = async (conn, userId) => {
    const query = `DELETE FROM USERS WHERE user_id = ?`;

    return await conn.query(query, [userId]);
}