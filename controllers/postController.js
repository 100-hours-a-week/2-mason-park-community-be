const userModel = require('../models/userModel');
const postModel = require('../models/postModel');
const functions = require("../utils/functions");
const validator = require('../utils/validator');
const status = require('../utils/message');
const path = require('path');
const fs = require('fs');

exports.createPost = (req, res, next) => {
    try {
        const blob = req.files['data'] ? req.files['data'][0] : null;
        const data = blob ? JSON.parse(fs.readFileSync(blob.path, 'utf8')) : null;
        const {title, content} = data;

        // 유효성 검사
        const isValid = (
            title && validator.validatePostTitle(title) &&
            content
        )
        if (!isValid) {
            return res
                .status(400)
                .json(functions.baseResponse(status.BAD_REQUEST.message))
        }

        // 이미지 체크
        let imageUrl;
        if (req.files['post_image']) {
            imageUrl = path.join('/image/users/', req.files.post_image[0].filename);
        }

        // 저장
        const post = postModel.save(title, content, imageUrl, req.session.user.id);

        return res
            .status(201)
            .json(functions.baseResponse(status.CREATED_IMAGE.message, {post_id: post.post_id}));
    } catch (e) {
        next(e);
    }
}

exports.getPosts = (req, res, next) => {
    try {
        const {offset, limit} = req.query;

        // 유효성 검사
        const pagedPosts = postModel.findAll(offset, limit);

        return res
            .status(200)
            .json(functions.pageResponse(
                status.OK.message,
                pagedPosts.offset,
                pagedPosts.limit,
                pagedPosts.total,
                pagedPosts.data.map((post) => {
                    const user = userModel.findById(post.user_id);
                    return {...post, user};
                }))
            );
    } catch (e) {
        next(e);
    }
}

exports.getPost = (req, res, next) => {
    try {
        const { post_id } = req.params;
        // 유효성 검사
        if (validator.validateId(post_id)) {
            return res
                .status(400)
                .json(functions.baseResponse(status.BAD_REQUEST.message));
        }
        const post = postModel.findById(post_id);
        if (!post) {
            return res
                .status(404)
                .json(functions.baseResponse(status.NOT_FOUND_POST.message))
        }

        const user = userModel.findById(post.user_id);

        return res
            .status(200)
            .json(functions.baseResponse(status.OK.message, {
                ...post, user
            }));
    } catch (e) {
        next(e);
    }
}

exports.updatePost = (req, res, next) => {
    try {
        const { post_id } = req.params;
        // Path Variable 유효성 검사
        if (validator.validateId(post_id)) {
            return res
                .status(400)
                .json(functions.baseResponse(status.BAD_REQUEST.message));
        }

        // 게시글 조회
        const post = postModel.findById(post_id);
        if (!post) {
            return res
                .status(404)
                .json(functions.baseResponse(status.NOT_FOUND_POST.message))
        }

        // 권한 검사
        if (String(post.user_id) !== String(req.session.user.id)) {
            return res
                .status(403)
                .json(functions.baseResponse(status.FORBIDDEN_POST.message))
        }

        // 데이터 유효성 검사
        const blob = req.files['data'] ? req.files['data'][0] : null;
        const data = blob ? JSON.parse(fs.readFileSync(blob.path, 'utf8')) : null;
        const {title, content} = data;

        const isValid = (
            title && validator.validatePostTitle(title) &&
            content
        )
        if (!isValid) {
            return res
                .status(400)
                .json(functions.baseResponse(status.BAD_REQUEST.message))
        }

        // 이미지 검사
        let imageUrl;
        if (req.files['post_image']) {
            imageUrl = path.join('/image/users/', req.files.post_image[0].filename);
        }

        const updatePost = postModel.update(post.post_id - 1, title, content, imageUrl);

        return res
            .status(200)
            .json(functions.baseResponse(status.OK.message, {post_id: updatePost.post_id}));
    } catch (e) {
        next(e);
    }
}