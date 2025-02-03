const response = require("../utils/response");
const {time} = require("../utils/response");

/* 알림 생성 */
exports.save = async (conn, type, message, sender_id, receiver_id) => {
    // INSERT NOTIFICATIONS
    const query = `INSERT INTO NOTIFICATIONS (notification_type, message, sender_id, receiver_id) VALUES (?, ?)`;
    const result = await conn.query(query, [type, message, sender_id, receiver_id]);

    // insertId : bigint | Number(insertId)
    return result;
}

/* 알림 조회 */
exports.findAll = async (conn, limit, offset, receiverId) => {
    // SELECT NOTIFICATIONS (with SENDER, RECEIVER)
    const contentQuery = `SELECT 
                           n.notification_id,
                           n.message,
                           n.notification_type,
                           n.is_read,
                           n.created_at, 
                           s.user_id,
                           s.nickname,
                           s.profile_image,
                          FROM NOTIFICATIONS AS n 
                          JOIN USERS AS s ON n.sender_id = s.user_id
                          WHERE n.receiver_id = ?
                          ORDER BY n.created_at DESC
                          LIMIT ? OFFSET ?
    `;
    const rows = await conn.query(contentQuery, [receiverId, limit, offset]);


    const countQuery = `SELECT COUNT(*) AS total FROM NOTIFICATIONS`;
    const [row] = await conn.query(countQuery);

    return response.page(
        null,
        offset,
        limit,
        Number(row.total),
        rows.map(row => ({
            notification_id: row.notification_id,
            message: row.message,
            notification_type: row.notification_type,
            is_read: row.is_read,
            created_at: time(row.created_at),
            sender: {
                sender_id: row.user_id,
                nickname: row.nickname,
                profile_image: row.profile_image,
            }
        }))
    )
}

/* 알림 유효성 검사용 */
exports.findById = async (conn, notificationId) => {
    const query = `SELECT
                    notification_id,
                    message,
                    notification_type,
                    created_at,
                    sender_id,
                    receiver_id
                   FROM NOTIFICATIONS
                   WHERE notification_id = ?
    `;

    const [row] = await conn.query(query, [notificationId]);

    return row; // Notification Object | undefined
}

/* 알림 읽음 처리 */
exports.updateIsRead = async (conn, notificationId, receiverId) => {
    const query = `UPDATE NOTIFICATIONS SET
                    is_read = TRUE
                   WHERE notification_id = ? AND receiver_id = ?
    `;
    return await conn.query(query, [notificationId, receiverId]);
}

/* 알림 삭제 */
exports.deleteById = async (conn, notificationId, receiverId) => {
    const query = `DELETE FROM NOTIFICATIONS WHERE notification_id = ? AND receiver_id = ?`;

    return await conn.query(query, [notificationId, receiverId]);
}