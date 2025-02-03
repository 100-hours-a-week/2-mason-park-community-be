const transaction = require("../db/transaction");
const validator = require("../utils/validator");
const {ValidationError, NotFoundError, ForbiddenError} = require("../utils/error");
const status = require("../utils/message");
const { notificationClients } = require("../utils/global")
const notificationModel = require("../models/notificationModel");
const response = require("../utils/response");

exports.subscribeNotification = async (req, res, next) => {
    const user_id = req.session.user?.user_id;

    // User ID 유효성 검사
    if (!validator.validateId(user_id)) {
        throw new ValidationError(status.BAD_REQUEST_ID.message);
    }

    // SSE 헤더 설정
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // 클라이언트 목록에 추가
    if (!notificationClients[user_id]) {
        notificationClients[user_id] = []
    }
    notificationClients[user_id].push(res);

    // 연결 종료 시 제거
    req.on("close", () => {
        notificationClients[user_id] = notificationClients[user_id].filter(client => client !== res);

        if (notificationClients[user_id].length === 0) {
            delete notificationClients[user_id];
        }
    })
}

exports.getNotifications = async (req, res, next) => {
    return await transaction(async (conn) => {
        const {offset, limit} = req.query;

        // 유효성 검사
        if (!offset || !limit) {
            throw new ValidationError(status.BAD_REQUEST_OFFSET_LIMIT.message);
        }

        const pagedNotifications = await notificationModel.findAll(
            conn,
            parseInt(limit),
            parseInt(offset),
            req.session.user?.user_id
        )

        return res
            .status(200)
            .json(response.page(
                status.OK.message,
                pagedNotifications.offset,
                pagedNotifications.limit,
                pagedNotifications.total,
                pagedNotifications.data,
            ))
    })
}

exports.readNotification = async (req, res, next) => {
    return await transaction(async (conn) => {
        const { notification_id } = req.params;

        // Notification ID 유효성 검사
        if (!validator.validateId(notification_id)) {
            throw new ValidationError(status.BAD_REQUEST_ID.message);
        }

        // 알림 불러오기
        const notification = await notificationModel.findById(conn, notification_id);
        if (!notification) {
            throw new NotFoundError(status.NOT_FOUND_NOTIFICATION.message);
        }

        // 권한 검사
        if (String(notification.receiver_id) !== String(req.session.user.user_id)) {
            throw new ForbiddenError(status.FORBIDDEN_NOTIFICATION.message);
        }

        await notificationModel.updateIsRead(
            conn,
            notification.notification_id,
            notification.receiver_id,
        )

        return res
            .status(200)
            .json(response.base(status.OK.message, {'notification_id': notification.notification_id}));
    })
}

exports.deleteNotification = async (req, res, next) => {
    return await transaction(async (conn) => {
        const { notification_id } = req.params;

        // Notification ID 유효성 검사
        if (!validator.validateId(notification_id)) {
            throw new ValidationError(status.BAD_REQUEST_ID.message);
        }

        // 알림 불러오기
        const notification = await notificationModel.findById(conn, notification_id);

        if (!notification) {
            throw new NotFoundError(status.NOT_FOUND_NOTIFICATION.message);
        }

        // 권한 검사
        if (String(notification.receiver_id) !== String(req.session.user.user_id)) {
            throw new ForbiddenError(status.FORBIDDEN_NOTIFICATION.message);
        }

        await notificationModel.deleteById(
            conn,
            notification.notification_id,
            notification.receiver_id
        );

        return res
            .status(204)
            .send();
    })
}