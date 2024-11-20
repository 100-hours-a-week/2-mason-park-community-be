const path = require('path');
const functions = require('../utils/functions');
const moment = require('moment');
const PATH = path.join(__dirname, process.env.DB_PATH_POST);

function Post (post_id, title, content, thumbs, views, comments, post_image, created_at, modified_at, user_id) {
    this.post_id = post_id;
    this.title = title;
    this.content = content;
    this.thumbs = thumbs;
    this.views = views;
    this.comments = comments;
    this.post_image = post_image;
    this.created_at = created_at;
    this.modified_at = modified_at;
    this.user_id = user_id;
}

exports.save = (title, content, post_image=null, user_id) => {
    const posts = functions.readDB(PATH);

    const post = new Post(
        posts.length + 1,
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
    functions.writeDB(PATH, posts);

    return post;
}

exports.findAll = (offset, limit) => {
    const posts = functions.readDB(PATH);

    return functions.page(
        offset,
        limit,
        posts.length,
        posts.slice(offset, offset + limit)
            .map(post =>  ({
                post_id: post.post_id,
                title: post.title,
                thumbs: post.thumbs,
                views: post.views,
                comments: post.comments,
                created_at: post.created_at,
                modified_at: post.modified_at,
                user_id: post.user_id,
            })
    ));
}

exports.findById = (postId) => {
    const posts = functions.readDB(PATH);

    const targetIdx = posts.findIndex((post) => String(post.post_id) === String(postId));
    posts[targetIdx] = {
        ...posts[targetIdx],
        views: posts[targetIdx].views + 1,
    }

    return posts[targetIdx];
}

exports.update = (postId, title, content, imageUrl) => {
    const posts = functions.readDB(PATH);

    const targetIdx = posts.findIndex((post) => String(post.post_id) === String(postId));
    posts[targetIdx] = {
        ...posts[targetIdx],
        title: title ? title : posts[targetIdx].title,
        content: content ? content : posts[targetIdx].content,
        post_image: imageUrl ? imageUrl : posts[targetIdx].post_image,
        modified_at: moment().format('YYYY-MM-DD HH:mm:ss')
    }

    functions.writeDB(PATH, posts);

    return posts[targetIdx];
}

exports.incrementCommentCount = (postId) => {
    const posts = functions.readDB(PATH);

    const targetIdx = posts.findIndex((post) => String(post.post_id) === String(postId));
    posts[targetIdx] = {
        ...posts[targetIdx],
        comments: posts[targetIdx].comments + 1,
    }

    functions.writeDB(PATH, posts);

    return posts[targetIdx];
}

exports.delete = (postId) => {
    const posts = functions.readDB(PATH);

    const targetIdx = posts.findIndex((post) => String(post.post_id) === String(postId));
    posts.splice(targetIdx, 1);

    functions.writeDB(PATH, posts);
}