const userModel = require('../models/userModel');
const postModel = require('../models/postModel');
const response = require("../utils/response");
const validator = require('../utils/validator');
const status = require('../utils/message');
const path = require('path');
const fs = require('fs');

exports.createPost = async (req, res, next) => {
    const blob = req.files?.data?.[0] || null;
    const {title, content} = blob ? JSON.parse(fs.readFileSync(blob.path, 'utf8')) : { };

    // 유효성 검사
    if (!title || !validator.validatePostTitle(title)) {
        throw new ValidationError(status.BAD_REQUEST_POST_TITLE.message);
    }

    if (!content) {
        throw new ValidationError(status.BAD_REQUEST_POST_CONTENT.message);
    }

    // 이미지 체크
    let imageUrl;
    if (req.files.post_image) {
        imageUrl = path.join('/image/users/', req.files.post_image[0].filename);
    }

    // 저장
    const post = await postModel.save(title, content, imageUrl, req.session.user.user_id);

    return res
        .status(201)
        .json(response.base(status.CREATED_POST.message, {post_id: post.post_id}));
}

exports.getPosts = async (req, res, next) => {
    const {offset, limit} = req.query;

    // 유효성 검사
    if (!offset || !limit) {
        throw new ValidationError(status.BAD_REQUEST_OFFSET_LIMIT.message);
    }

    const pagedPosts = await postModel.findAll(offset, limit);

    return res
        .status(200)
        .json(response.page(
            status.OK.message,
            pagedPosts.offset,
            pagedPosts.limit,
            pagedPosts.total,
            await Promise.all(pagedPosts.data.map(async (post) => {
                const user = await userModel.findById(post.user_id);
                return {...post, user};
            })))
        );
}

exports.getPost = async (req, res, next) => {
    const { post_id } = req.params;
    // 유효성 검사
    if (!validator.validateId(post_id)) {
        throw new ValidationError(status.BAD_REQUEST_ID.message);
    }

    const post = await postModel.findById(post_id);

    if (!post) {
        throw new ValidationError(status.NOT_FOUND_POST.message);
    }

    const user = await userModel.findById(post.user_id);

    return res
        .status(200)
        .json(response.base(status.OK.message, {
            ...post, user
        }));
}

exports.updatePost = async (req, res, next) => {
    const { post_id } = req.params;

    // Path Variable 유효성 검사
    if (!validator.validateId(post_id)) {
        throw new ValidationError(status.BAD_REQUEST_ID.message);
    }

    // 게시글 조회
    const post = await postModel.findById(post_id);
    if (!post) {
        throw new NotFoundError(status.NOT_FOUND_POST.message);
    }

    // 권한 검사
    if (String(post.user_id) !== String(req.session.user.user_id)) {
        throw new ForbiddenError(status.FORBIDDEN_POST.message);
    }

    // 데이터 유효성 검사
    const blob = req.files?.data?.[0] || null;
    const {title, content} = blob ? JSON.parse(fs.readFileSync(blob.path, 'utf8')) : { };

    // 유효성 검사
    if (!title || !validator.validatePostTitle(title)) {
        throw new ValidationError(status.BAD_REQUEST_POST_TITLE.message);
    }

    if (!content) {
        throw new ValidationError(status.BAD_REQUEST_POST_CONTENT.message);
    }

    // 이미지 체크
    let imageUrl;
    if (req.files.post_image) {
        imageUrl = path.join('/image/users/', req.files.post_image[0].filename);
    }

    const updatePost = await postModel.update(post.post_id, title, content, imageUrl);

    return res
        .status(200)
        .json(response.base(status.OK.message, {post_id: updatePost.post_id}));
}

exports.deletePost = async (req, res, next) => {
    const { post_id } = req.params;

    // Path Variable 유효성 검사
    if (!validator.validateId(post_id)) {
        throw new ValidationError(status.BAD_REQUEST_ID.message);
    }

    // 게시글 조회
    const post = await postModel.findById(post_id);

    if (!post) {
        throw new NotFoundError(status.NOT_FOUND_POST.message);
    }

    // 권한 검사
    if (String(post.user_id) !== String(req.session.user.user_id)) {
        throw new ForbiddenError(status.FORBIDDEN_POST.message);
    }

    // TODO : 댓글 삭제
    await postModel.deleteById(post.post_id);

    return res
        .status(204);
}