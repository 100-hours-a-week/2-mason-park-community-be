const postModel = require('../models/postModel');
const commentModel = require('../models/commentModel');
const transaction = require('../db/transaction');
const response = require("../utils/response");
const validator = require('../utils/validator');
const status = require('../utils/message');
const {ValidationError, NotFoundError, ForbiddenError} = require("../utils/error");

exports.createComment = async (req, res, next) => {
    return await transaction(async (conn) => {
        const { post_id } = req.params;

        // Post ID 유효성 검사
        if (!validator.validateId(post_id)) {
            throw new ValidationError(status.BAD_REQUEST.message);
        }

        // Post 유효성 검사
        const post = postModel.findById(conn, post_id);
        if (!post) {
            throw new NotFoundError(status.NOT_FOUND_POST.message);
        }

        // 댓글 내용 유효성 검사
        const { content } = req.body;
        if (!content) {
            throw new ValidationError(status.BAD_REQUEST_COMMENT_CONTENT.message);
        }

        // 댓글 저장
        const result = await commentModel.save(conn, content, req.session.user.user_id, post_id);

        // 댓글 수 올리기
        await postModel.incrementCommentCount(conn,post_id);

        return res
            .status(201)
            .json(response.base(status.CREATED_COMMENT.message, {comment_id: Number(result.insertId)}));
    })
}

exports.getComments = async (req, res, next) => {
    return transaction(async (conn) => {
        // Path Variable 유효성 검사
        const { post_id } = req.params;

        // Post ID 유효성 검사
        if (!validator.validateId(post_id)) {
            throw new ValidationError(status.BAD_REQUEST_ID.message);
        }

        // Post 유효성 검사
        const post = await postModel.findById(conn, post_id);

        if (!post) {
            throw new NotFoundError(status.NOT_FOUND_POST.message);
        }

        // 댓글 목록 조회
        const comments = await commentModel.findAllByPostId(conn, post_id);

        return res
            .status(200)
            .json(response.base(
                status.OK.message,
                comments
            ))
    })
}

exports.updateComment = async (req, res, next) => {
    return await transaction(async (conn) => {
        // Path Variable 유효성 검사
        const { post_id, comment_id } = req.params;

        // Post ID와 Comment ID 유효성 검사
        if (!validator.validateId(post_id) || !validator.validateId(comment_id)) {
            throw new ValidationError(status.BAD_REQUEST_ID.message);
        }

        // Post 유효성 검사
        const post = await postModel.findById(conn, post_id);

        if (!post) {
            throw new NotFoundError(status.NOT_FOUND_POST.message);
        }

        // Comment 유효성 검사
        const comment = await commentModel.findById(conn, comment_id);

        if (!comment) {
            throw new NotFoundError(status.NOT_FOUND_COMMENT.message);
        }

        // 권한 검사
        if (String(comment.user_id) !== String(req.session.user.user_id)) {
            throw new ForbiddenError(status.FORBIDDEN_COMMENT.message);
        }

        // 댓글 내용 유효성 검사
        const { content } = req.body;
        if (!content) {
            throw new ValidationError(status.BAD_REQUEST_COMMENT_CONTENT.message);
        }

        // 댓글 수정
        await commentModel.update(conn, content, comment.comment_id);

        return res
            .status(200)
            .json(response.base(status.OK.message, { comment_id: comment.comment_id}));
    })
}

exports.deleteComment = async (req, res, next) => {
    return await transaction(async (conn) => {
        // Path Variable 유효성 검사
        const { post_id, comment_id } = req.params;

        // Post ID와 Comment ID 유효성 검사
        if (!validator.validateId(post_id) || !validator.validateId(comment_id)) {
            throw new ValidationError(status.BAD_REQUEST_ID.message);
        }

        // Post 유효성 검사
        const post = await postModel.findById(conn, post_id);

        if (!post) {
            throw new NotFoundError(status.NOT_FOUND_POST.message);
        }

        // Comment 유효성 검사
        const comment = await commentModel.findById(conn, comment_id);

        if (!comment) {
            throw new NotFoundError(status.NOT_FOUND_COMMENT.message);
        }

        // 권한 검사
        if (String(comment.user_id) !== String(req.session.user.user_id)) {
            throw new ForbiddenError(status.FORBIDDEN_COMMENT.message);
        }

        await postModel.decrementCommentCount(conn, post_id);
        await commentModel.deleteById(conn, comment.comment_id);

        return res
            .status(204)
            .send();
    })
}