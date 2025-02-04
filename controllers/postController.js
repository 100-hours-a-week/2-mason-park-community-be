const postModel = require('../models/postModel');
const postThumbsModel = require('../models/postThumbsModel');
const transaction = require('../db/transaction');
const response = require("../utils/response");
const validator = require('../utils/validator');
const {status, notification} = require('../utils/message');
const {ValidationError, NotFoundError, ForbiddenError} = require("../utils/error");
const {time} = require("../utils/response");
const {sendNotification} = require("./notificationController");

exports.createPost = async (req, res, next) => {
    return await transaction(async (conn) => {
        const {title, content, post_image} = req.body;

        // 제목 유효성 검사
        if (!title || !validator.validatePostTitle(title)) {
            throw new ValidationError(status.BAD_REQUEST_POST_TITLE.message);
        }

        // 내용 유효성 검사
        if (!content) {
            throw new ValidationError(status.BAD_REQUEST_POST_CONTENT.message);
        }

        // 게시글 저장
        const result = await postModel.save(conn,title, content, post_image, req.session.user.user_id);

        return res
            .status(201)
            .json(response.base(status.CREATED_POST.message, {post_id: Number(result.insertId)}));
    })
}

exports.getPosts = async (req, res, next) => {
    return await transaction(async (conn) => {
        const {offset, limit} = req.query;

        // 유효성 검사
        if (!offset || !limit) {
            throw new ValidationError(status.BAD_REQUEST_OFFSET_LIMIT.message);
        }

        const pagedPosts = await postModel.findAll(
            conn,
            parseInt(limit),
            parseInt(offset),
            req.session.user?.user_id
        );

        return res
            .status(200)
            .json(response.page(
                status.OK.message,
                pagedPosts.offset,
                pagedPosts.limit,
                pagedPosts.total,
                pagedPosts.data
            ));
    })
}

exports.getPost = async (req, res, next) => {
    return await transaction(async (conn) => {
        const { post_id } = req.params;
        // Post ID 유효성 검사
        if (!validator.validateId(post_id)) {
            throw new ValidationError(status.BAD_REQUEST_ID.message);
        }

        // 게시글 조회
        const post = await postModel.findByIdWithUser(conn, req.session.user?.user_id, post_id);

        if (!post) {
            throw new ValidationError(status.NOT_FOUND_POST.message);
        }

        // 조회수 증가
        await postModel.incrementViewCount(conn, post_id);

        // Q : 조회수 동시성 문제 ? (크리티컬한 문제는 아님)
        return res
            .status(200)
            .json(response.base(status.OK.message, {
                ...post,
                view_count: post.view_count + 1,
            }));
    })
}

exports.updatePost = async (req, res, next) => {
    return await transaction(async (conn) => {
        const { post_id } = req.params;

        // Post ID 유효성 검사
        if (!validator.validateId(post_id)) {
            throw new ValidationError(status.BAD_REQUEST_ID.message);
        }

        // 게시글 불러오기
        const post = await postModel.findById(conn,post_id);
        if (!post) {
            throw new NotFoundError(status.NOT_FOUND_POST.message);
        }

        // 권한 검사
        if (String(post.user_id) !== String(req.session.user.user_id)) {
            throw new ForbiddenError(status.FORBIDDEN_POST.message);
        }

        // 데이터 유효성 검사
        const {title, content, post_image} = req.body;

        // 제목 유효성 검사
        if (!title || !validator.validatePostTitle(title)) {
            throw new ValidationError(status.BAD_REQUEST_POST_TITLE.message);
        }

        // 내용 유효성 검사
        if (!content || !validator.validatePostContent(content)) {
            throw new ValidationError(status.BAD_REQUEST_POST_CONTENT.message);
        }

        await postModel.update(
            conn,
            title,
            content,
            post_image ? post_image : post.post_image,
            post.post_id
        );

        return res
            .status(200)
            .json(response.base(status.OK.message, {post_id: post.post_id}));
    })
}

exports.deletePost = async (req, res, next) => {
    return await transaction(async (conn) => {
        const { post_id } = req.params;

        // Post ID 유효성 검사
        if (!validator.validateId(post_id)) {
            throw new ValidationError(status.BAD_REQUEST_ID.message);
        }

        // 게시글 불러오기
        const post = await postModel.findById(conn, post_id);

        if (!post) {
            throw new NotFoundError(status.NOT_FOUND_POST.message);
        }

        // 권한 검사
        if (String(post.user_id) !== String(req.session.user.user_id)) {
            throw new ForbiddenError(status.FORBIDDEN_POST.message);
        }

        await postModel.deleteById(conn, post.post_id);

        return res
            .status(204)
            .send();
    })
}

exports.thumbsUpPost = async (req, res, next) => {
    return await transaction(async (conn) => {
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

        // 이미 좋아요 했는지 확인
        if (await postThumbsModel.existsByUserIdAndPostId(conn, req.session.user.user_id, post_id)) {
            throw new ValidationError(status.CONFLICT_POST_THUMBS.message);
        }

        // 게시글 좋아요 등록
        const result = await postThumbsModel.save(conn, req.session.user.user_id, post_id);

        // 게시글 좋아요 증가
        await postModel.incrementThumbsCount(conn, post_id);

        // 알림 전송
        if (String(post.user_id) !== String(req.session.user.user_id)) {
            const notificationPayload = {
                notification_type: 'LIKE',
                message: notification.LIKE,
                is_read: false,
                created_at: time(new Date()),
                sender: {
                    user_id: req.session.user.user_id,
                    profile_image: req.session.user.profile_image,
                    nickname: req.session.user.nickname,
                },
                receiver: {
                    user_id: post.user_id
                }
            }

            await sendNotification(conn, notificationPayload);
        }

        return res
            .status(201)
            .send(response.base(status.CREATED_POST_THUMBS_UP.message, {thumb_id: Number(result.insertId)}));
    })
}

exports.thumbsDownPost = async (req, res, next) => {
    return await transaction(async (conn) => {
        const { post_id } = req.params;

        // Post ID 유효성 검사
        if (!validator.validateId(post_id)) {
            throw new ValidationError(status.BAD_REQUEST_ID.message);
        }

        // 이미 좋아요 했는지 확인
        if (!await postThumbsModel.existsByUserIdAndPostId(conn, req.session.user.user_id, post_id)) {
            throw new ValidationError(status.NOT_FOUND_POST_THUMBS.message);
        }

        // 게시글 좋아요 삭제
        await postThumbsModel.deleteByUserIdAndPostId(conn, req.session.user.user_id, post_id);
        // 게시글 좋아요 감소
        await postModel.decrementThumbsCount(conn, post_id);

        return res
            .status(204)
            .send();
    })
}