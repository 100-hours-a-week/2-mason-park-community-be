const path = require('path');
const functions = require('../utils/functions');
const moment = require('moment');
const PATH = path.join(__dirname, process.env.DB_PATH_COMMENT);

function Comment (comment_id, content, created_at, modified_at, user_id, post_id) {
    this.comment_id = comment_id;
    this.content = content;
    this.created_at = created_at;
    this.modified_at = modified_at;
    this.user_id = user_id;
    this.post_id = post_id;
}

exports.save = (content, userId, postId) => {
    const comments = functions.readDB(PATH);

    const comment = new Comment(
        comments.length + 1,
        content,
        moment().format('YYYY-MM-DD HH:mm:ss'),
        moment().format('YYYY-MM-DD HH:mm:ss'),
        userId,
        postId
    );

    comments.push(comment);
    functions.writeDB(PATH, comments);

    return comment;
}

exports.findById = (commentId) => {
    const comments = functions.readDB(PATH);

    return comments
        .find(comment => String(comment.comment_id) === String(commentId));
}

exports.findAllByPostId = (postId) => {
    const comments = functions.readDB(PATH);

    return comments
        .filter(comment => String(comment.post_id) === String(postId))
        .sort((a, b) => a.id - b.id)
}

exports.update = (commentId, content) => {
    const comments = functions.readDB(PATH);

    const targetIdx = comments
        .findIndex(comment => String(comment.comment_id) === String(commentId));

    comments[targetIdx].content = content ? content : comments[targetIdx].content;

    functions.writeDB(PATH, comments);

    return comments[targetIdx];
}

exports.delete = (commentId) => {
    const comments = functions.readDB(PATH);

    const targetIdx = comments
        .findIndex(comment => String(comment.comment_id) === String(commentId));

    comments.splice(targetIdx, 1);

    functions.writeDB(PATH, comments);
}