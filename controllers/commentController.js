const userModel = require('../models/userModel');
const postModel = require('../models/postModel');
const commentModel = require('../models/commentModel');
const response = require("../utils/response");
const validator = require('../utils/validator');
const status = require('../utils/message');

exports.createComment = async (req, res, next) => {
    // Path Variable 유효성 검사
    const { post_id } = req.params;

    if (!validator.validateId(post_id)) {
        throw new ValidationError(status.BAD_REQUEST.message);
    }

    // Post 유효성 검사
    const post = postModel.findById(post_id);
    if (!post) {
        throw new NotFoundError(status.NOT_FOUND_POST.message);
    }

    // 유효성 검사
    const { content } = req.body;
    if (!content) {
        throw new ValidationError(status.BAD_REQUEST_COMMENT_CONTENT.message);
    }

    // 저장
    const comment = await commentModel.save(content, req.session.user.user_id, post_id);

    // 댓글 수 올리기
    await postModel.incrementCommentCount(post_id);

    return res
        .status(201)
        .json(response.base(status.CREATED_COMMENT.message, {comment_id: comment.comment_id}));
}

exports.getComments = async (req, res, next) => {
        // Path Variable 유효성 검사
        const { post_id } = req.params;

        if (!validator.validateId(post_id)) {
            throw new ValidationError(status.BAD_REQUEST_ID.message);
        }

        // Post 유효성 검사
        const post = await postModel.findById(post_id);

        if (!post) {
            throw new NotFoundError(status.NOT_FOUND_POST.message);
        }

        const comments = await commentModel.findAllByPostId(post_id);

        return res
            .status(200)
            .json(response.base(
                status.OK.message,
                await Promise.all(comments.map(async (comment) => {
                    const user = await userModel.findById(comment.user_id);
                    return {...comment, user}
                }))))
}

exports.updateComment = async (req, res, next) => {
    // Path Variable 유효성 검사
    const { post_id, comment_id } = req.params;

    if (!validator.validateId(post_id) || !validator.validateId(comment_id)) {
        throw new ValidationError(status.BAD_REQUEST_ID.message);
    }

    // Post 유효성 검사
    const post = await postModel.findById(post_id);

    if (!post) {
        throw new NotFoundError(status.NOT_FOUND_POST.message);
    }

    // Comment 유효성 검사
    const comment = await commentModel.findById(comment_id);

    if (!comment) {
        throw new NotFoundError(status.NOT_FOUND_COMMENT.message);
    }

    // 권한 검사
    if (String(comment.user_id) !== String(req.session.user.user_id)) {
        throw new ForbiddenError(status.FORBIDDEN_COMMENT.message);
    }

    // 유효성 검사
    const { content } = req.body;
    if (!content) {
        throw new ValidationError(status.BAD_REQUEST_COMMENT_CONTENT.message);
    }

    const updateComment = await commentModel.update(comment.comment_id, content);

    return res
        .status(200)
        .json(response.base(status.OK.message, { comment_id: updateComment.comment_id}));
}

exports.deleteComment = async (req, res, next) => {
    // Path Variable 유효성 검사
    const { post_id, comment_id } = req.params;

    if (!validator.validateId(post_id) || !validator.validateId(comment_id)) {
        throw new ValidationError(status.BAD_REQUEST_ID.message);
    }

    // Post 유효성 검사
    const post = await postModel.findById(post_id);

    if (!post) {
        throw new NotFoundError(status.NOT_FOUND_POST.message);
    }

    // Comment 유효성 검사
    const comment = await commentModel.findById(comment_id);

    if (!comment) {
        throw new NotFoundError(status.NOT_FOUND_COMMENT.message);
    }

    // 권한 검사
    if (String(comment.user_id) !== String(req.session.user.user_id)) {
        throw new ForbiddenError(status.FORBIDDEN_COMMENT.message);
    }

    await commentModel.deleteById(comment.comment_id);

    return res
        .status(204)
}