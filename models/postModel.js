const {time} = require("../utils/response");
const response = require("../utils/response");

/* 게시글 생성 */
exports.save = async (conn, title, content, post_image, userId) => {
    // INSERT POSTS
    const query = `INSERT INTO POSTS (title, content, post_image, user_id) VALUES (?, ?, ?, ?)`;
    const result = await conn.query(query, [title, content, post_image, userId]);

    // INSERT POST_METAS
    const metaQuery = `INSERT INTO POST_METAS (post_id) VALUES (?)`;
    await conn.query(metaQuery, [Number(result.insertId)]);

    // insertId : bigint | Number(insertId)
    return result;
}

/* 게시글 목록 조회 */
// TODO : no offset pagination
exports.findAll = async (conn, limit, offset, viewerId) => {
    // SELECT POSTS (with USERS, POST_METAS)
    const contentQuery = `SELECT 
                           p.post_id,
                           p.title, 
                           pm.comment_count,
                           pm.view_count,
                           pm.thumb_count,
                           p.created_at,
                           u.user_id,
                           u.nickname,
                           u.profile_image,
                           (SELECT 1 FROM POST_THUMBS AS pt
                               WHERE pt.post_id = p.post_id AND pt.user_id = ?) AS is_thumbs
                          FROM POSTS AS p 
                          JOIN USERS AS u ON p.user_id = u.user_id
                          JOIN POST_METAS AS pm ON p.post_id = pm.post_id
                          ORDER BY p.created_at DESC
                          LIMIT ? OFFSET ?
    `;
    const rows = await conn.query(contentQuery, [viewerId, limit, offset]);


    const countQuery = `SELECT COUNT(*) AS total FROM POSTS`;
    const [row] = await conn.query(countQuery);

    return response.page(
        null,
        offset,
        limit,
        Number(row.total),
        rows.map(row => ({
            post_id: row.post_id,
            title: row.title,
            thumb_count: row.thumb_count,
            view_count: row.view_count,
            comment_count: row.comment_count,
            created_at: time(row.created_at),
            is_thumbs: row.is_thumbs,
            user: {
                user_id: row.user_id,
                nickname: row.nickname,
                profile_image: row.profile_image,
            }
        }))
    )
}

/* 게시글 상세 조회 */
exports.findByIdWithUser = async (conn, viewerId, postId) => {
    const query = `SELECT
                    p.post_id,
                    p.title, 
                    p.content,
                    pm.comment_count,
                    pm.view_count,
                    pm.thumb_count,
                    p.post_image,
                    p.created_at,
                    u.user_id,
                    u.nickname,
                    u.profile_image,
                    (SELECT 1 FROM POST_THUMBS AS pt
                               WHERE pt.post_id = p.post_id AND pt.user_id = ?) AS is_thumbs 
                   FROM POSTS AS p
                   JOIN USERS AS u ON p.user_id = u.user_id
                   JOIN POST_METAS AS pm ON p.post_id = pm.post_id
                   WHERE p.post_id = ?
    `;

    const [row] = await conn.query(query, [viewerId, postId]);

    return {
        post_id: row.post_id,
        title: row.title,
        content: row.content,
        post_image: row.post_image,
        thumb_count: row.thumb_count,
        view_count: row.view_count,
        comment_count: row.comment_count,
        created_at: time(row.created_at),
        is_thumbs: row.is_thumbs,
        user: {
            user_id: row.user_id,
            nickname: row.nickname,
            profile_image: row.profile_image,
        }
    }; // Post Detail Object | undefined
}

/* 게시글 수정, 게시글 유효성 검사 */
exports.findById = async (conn, postId) => {
    const query = `SELECT
                    p.post_id,
                    p.title, 
                    p.content,
                    pm.comment_count,
                    pm.view_count,
                    pm.thumb_count,
                    p.post_image,
                    p.created_at,
                    u.user_id,
                    u.nickname,
                    u.profile_image
                   FROM POSTS AS p
                   JOIN USERS AS u ON p.user_id = u.user_id
                   JOIN POST_METAS AS pm ON p.post_id = pm.post_id
                   WHERE p.post_id = ?
    `;

    const [row] = await conn.query(query, [postId]);

    return row; // Post Detail Object | undefined
}

/* 게시글 수정 */
exports.update = async (conn, title, content, post_image, postId) => {
    const query = `UPDATE POSTS SET
                    title = ?, 
                    content = ?, 
                    post_image = ? 
                   WHERE post_id = ?
    `;

    return await conn.query(query, [title, content, post_image, postId]);
}

/* 조회 수 증가 */
exports.incrementViewCount = async (conn, postId) => {
    const query = `UPDATE POST_METAS SET
                    view_count = view_count + 1
                   WHERE post_id = ?
    `

    return await conn.query(query, [postId]);
}

/* 댓글 수 증가 */
exports.incrementCommentCount = async (conn, postId) => {
    const query = `UPDATE POST_METAS SET
                    comment_count = comment_count + 1
                   WHERE post_id = ?
    `

    return await conn.query(query, [postId]);
}

/* 댓글 수 감소 */
exports.decrementCommentCount = async (conn, postId) => {
    const query = `UPDATE POST_METAS SET
                    comment_count = comment_count - 1
                   WHERE post_id = ?
    `

    return await conn.query(query, [postId]);
}

/* 좋아요 수 증가 */
exports.incrementThumbsCount = async (conn, postId) => {
    const query = `UPDATE POST_METAS SET
                    thumb_count = thumb_count + 1
                   WHERE post_id = ?
    `

    return await conn.query(query, [postId]);
}

/* 좋아요 수 감소 */
exports.decrementThumbsCount = async (conn, postId) => {
    const query = `UPDATE POST_METAS SET
                    thumb_count = thumb_count - 1
                   WHERE post_id = ?
    `

    return await conn.query(query, [postId]);
}

/* 게시글 삭제 */
exports.deleteById = async (conn, postId) => {
    const query = `DELETE FROM POSTS WHERE post_id = ?`;

    return await conn.query(query, [postId]);
}