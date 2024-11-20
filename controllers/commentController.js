const userModel = require('../models/userModel');
const postModel = require('../models/postModel');
const commentModel = require('../models/commentModel');
const functions = require("../utils/functions");
const validator = require('../utils/validator');
const status = require('../utils/message');
const path = require('path');
const fs = require('fs');

exports.createComment = (req, res, next) => {
    try {
        // Path Variable 유효성 검사
        const { post_id } = req.params;
        // 유효성 검사
        if (!validator.validateId(post_id)) {
            return res
                .status(400)
                .json(functions.baseResponse(status.BAD_REQUEST.message));
        }

        // Post 유효성 검사
        const post = postModel.findById(post_id);
        if (!post) {
            return res
                .status(404)
                .json(functions.baseResponse(status.NOT_FOUND_POST.message));
        }
        const { content } = req.body;
        // 유효성 검사
        if (!content) {
            return res
                .status(400)
                .json(functions.baseResponse(status.BAD_REQUEST.message))
        }

        // 저장
        const comment = commentModel.save(content, req.session.user.user_id, post_id);

        // 댓글 수 올리기
        postModel.incrementCommentCount

        return res
            .status(201)
            .json(functions.baseResponse(status.CREATED_COMMENT.message, {comment_id: comment.comment_id}));
    } catch (e) {
        next(e);
    }
}

exports.getComments = (req, res, next) => {
    try {
        // Path Variable 유효성 검사
        const { post_id } = req.params;
        // 유효성 검사
        if (!validator.validateId(post_id)) {
            return res
                .status(400)
                .json(functions.baseResponse(status.BAD_REQUEST.message));
        }

        // Post 유효성 검사
        const post = postModel.findById(post_id);
        if (!post) {
            return res
                .status(404)
                .json(functions.baseResponse(status.NOT_FOUND_POST.message));
        }

        const comments = commentModel.findAllByPostId(post_id);

        return res
            .status(200)
            .json(functions.baseResponse(
                status.OK.message,
                comments.map(comment => {
                    const user = userModel.findById(comment.user_id);
                    return {...comment, user}
                })))
    } catch (e) {
        next(e);
    }
}

exports.updateComment = (req, res, next) => {
    try {
        // Path Variable 유효성 검사
        const { post_id, comment_id } = req.params;

        if (!validator.validateId(post_id) || !validator.validateId(comment_id)) {
            return res
                .status(400)
                .json(functions.baseResponse(status.BAD_REQUEST.message));
        }

        // Post 유효성 검사
        const post = postModel.findById(post_id);
        if (!post) {
            return res
                .status(404)
                .json(functions.baseResponse(status.NOT_FOUND_POST.message));
        }

        // Comment 유효성 검사
        const comment = commentModel.findById(comment_id);
        if (!comment) {
            return res
                .status(404)
                .json(functions.baseResponse(status.NOT_FOUND_COMMENT.message));
        }

        // 권한 검사
        if (String(comment.user_id) !== String(req.session.user.user_id)) {
            return res
                .status(403)
                .json(functions.baseResponse(status.FORBIDDEN_COMMENT.message))
        }

        // 유효성 검사
        const { content } = req.body;
        if (!content) {
            return res
                .status(400)
                .json(functions.baseResponse(status.BAD_REQUEST.message))
        }

        const updateComment = commentModel.update(comment.comment_id, content);

        return res
            .status(200)
            .json(functions.baseResponse(status.OK.message, { comment_id: updateComment.comment_id}))
    } catch (e) {
        next(e);
    }
}
