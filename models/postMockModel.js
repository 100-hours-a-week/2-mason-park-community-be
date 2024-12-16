const path = require('path');
const functions = require('../utils/functions');
const response = require('../utils/response');
const moment = require('moment');
const {generateId} = require("./IDGenerator");
const PATH = path.join(__dirname, process.env.DB_PATH_POST);

function Post (post_id, title, content, thumb_count, view_count, comment_count, post_image, created_at, modified_at, user_id) {
    this.post_id = post_id;
    this.title = title;
    this.content = content;
    this.thumb_count = thumb_count;
    this.view_count = view_count;
    this.comment_count = comment_count;
    this.post_image = post_image;
    this.created_at = created_at;
    this.modified_at = modified_at;
    this.user_id = user_id;
}

exports.save = async (title, content, post_image=null, user_id) => {
    const posts = await functions.readDB(PATH);

    const post = new Post(
        generateId('posts'),
        title,
        content,
        0,
        0,
        0,
        post_image,
        moment().format('YYYY-MM-DD HH:mm:ss'),
        moment().format('YYYY-MM-DD HH:mm:ss'),
        user_id
    );

    posts.push(post);
    await functions.writeDB(PATH, posts);

    return post;
}

exports.findAll = async (offset, limit) => {
    const posts = await functions.readDB(PATH);

    return response.page(
        '',
        offset,
        limit,
        posts.length,
        [...posts]
            .sort((a, b) => b.post_id - a.post_id)
            .slice(offset, offset + limit)
            .map(post => ({
                post_id: post.post_id,
                title: post.title,
                thumb_count: post.thumb_count,
                view_count: post.view_count,
                comment_count: post.comment_count,
                created_at: post.created_at,
                modified_at: post.modified_at,
                user_id: post.user_id,
            })
    ));
}

exports.findById = async (postId) => {
    const posts = await functions.readDB(PATH);

    const targetIdx = posts.findIndex((post) => String(post.post_id) === String(postId));
    posts[targetIdx] = {
        ...posts[targetIdx],
        view_count: posts[targetIdx].view_count + 1,
    }

    await functions.writeDB(PATH, posts);

    return posts[targetIdx];
}

exports.update = async (postId, title, content, imageUrl) => {
    const posts = await functions.readDB(PATH);

    const targetIdx = posts.findIndex((post) => String(post.post_id) === String(postId));
    posts[targetIdx] = {
        ...posts[targetIdx],
        title: title ? title : posts[targetIdx].title,
        content: content ? content : posts[targetIdx].content,
        post_image: imageUrl ? imageUrl : posts[targetIdx].post_image,
        modified_at: moment().format('YYYY-MM-DD HH:mm:ss')
    }

    await functions.writeDB(PATH, posts);

    return posts[targetIdx];
}

exports.incrementCommentCount = async (postId) => {
    const posts = await functions.readDB(PATH);

    const targetIdx = posts.findIndex((post) => String(post.post_id) === String(postId));
    posts[targetIdx] = {
        ...posts[targetIdx],
        comment_count: posts[targetIdx].comment_count + 1,
    }

    await  functions.writeDB(PATH, posts);

    return posts[targetIdx];
}

exports.decrementCommentCount = async (postId) => {
    const posts = await functions.readDB(PATH);

    const targetIdx = posts.findIndex((post) => String(post.post_id) === String(postId));
    posts[targetIdx] = {
        ...posts[targetIdx],
        comment_count: posts[targetIdx].comment_count - 1,
    }

    await  functions.writeDB(PATH, posts);

    return posts[targetIdx];
}

exports.deleteById = async (postId) => {
    const posts = await functions.readDB(PATH);

    const targetIdx = posts.findIndex((post) => String(post.post_id) === String(postId));
    posts.splice(targetIdx, 1);

    await functions.writeDB(PATH, posts);
}

exports.deleteAllByUserId = async (userId) => {
    const posts = await functions.readDB(PATH);

    const filteredPosts = posts
        .filter(post => String(post.user_id) === String(userId));

    await functions.writeDB(PATH, filteredPosts);
}