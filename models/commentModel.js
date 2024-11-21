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

exports.save = async (content, userId, postId) => {
    const comments = await functions.readDB(PATH);

    const comment = new Comment(
        comments.length + 1,
        content,
        moment().format('YYYY-MM-DD HH:mm:ss'),
        moment().format('YYYY-MM-DD HH:mm:ss'),
        userId,
        postId
    );

    comments.push(comment);
    await functions.writeDB(PATH, comments);

    return comment;
}

exports.findById = async (commentId) => {
    const comments = await  functions.readDB(PATH);

    return comments
        .find(comment => String(comment.comment_id) === String(commentId));
}

exports.findAllByPostId = async (postId) => {
    const comments = await functions.readDB(PATH);

    return comments
        .filter(comment => String(comment.post_id) === String(postId))
        .sort((a, b) => a.id - b.id)
}

exports.update = async (commentId, content) => {
    const comments = await functions.readDB(PATH);

    const targetIdx = comments
        .findIndex(comment => String(comment.comment_id) === String(commentId));

    comments[targetIdx].content = content ? content : comments[targetIdx].content;

    await functions.writeDB(PATH, comments);

    return comments[targetIdx];
}

exports.deleteById = async (commentId) => {
    const comments = await functions.readDB(PATH);

    const targetIdx = comments
        .findIndex(comment => String(comment.comment_id) === String(commentId));

    comments.splice(targetIdx, 1);

    await functions.writeDB(PATH, comments);
}