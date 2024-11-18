const userModel = require('../models/userModel');
const functions = require('../utils/functions');
const path = require('path');
const validator = require("../utils/validator");
const crypto = require("crypto-js");
const status = require('../utils/message');

exports.uploadProfileImage = (req, res, next) => {
    try {
        if (!req.file) {
            return res
                .status(400)
                .json(functions.baseResponse(status.BAD_REQUEST_IMAGE.message));
        }

        const imageUrl = path.join('/image/users/', req.file.filename);

        res
            .status(201)
            .json(functions.baseResponse(status.CREATED_IMAGE.message, {
                'profile_image': imageUrl
            }));
    } catch (e) {
        next(e);
    }
}

exports.getMyProfile = (req, res, next) => {
    try {
        return res
            .status(200)
            .json(functions.baseResponse(status.OK.message, {
                'user_id': req.session.user.user_id,
                'email': req.session.user.email,
                'nickname': req.session.user.nickname,
                'profile_image': req.session.user.profile_image
            }))
    } catch (e) {
        next(e);
    }
}

exports.updateMyProfile = (req, res, next) => {
    try {
        const { profile_image, nickname } = req.body;

        // 유효성 검사
        const isValid = (
            profile_image ||
            (nickname && validator.validateNickname(nickname))
        );

        if (!isValid) {
            return res
                .status(400)
                .json(functions.baseResponse(status.BAD_REQUEST.message));
        }

        // 유저 정보 수정
        const user = userModel.update(req.session.user.id, profile_image, nickname);

        if(!user) {
            return res
                .status(404)
                .json(functions.baseResponse(status.NOT_FOUND_USER.message))
        }

        return res
            .status(200)
            .json(functions.baseResponse(status.OK.message, {'user_id': user.user_id}));

    } catch (e) {
        next(e);
    }
}

exports.updatePassword = (req, res, next) => {
    try {
        const { password } = req.body;
        const decodedPassword = Buffer.from(password, "base64").toString("utf-8");

        // 유효성 검사
        const isValid = (
            decodedPassword && validator.validatePassword(decodedPassword)
        );

        if (!isValid) {
            return res
                .status(400)
                .json(functions.baseResponse(status.BAD_REQUEST.message));
        }

        // 유저 정보 수정
        const encryptedPassword = crypto.AES.encrypt(decodedPassword, process.env.CRYPTO_SECRET_KEY).toString();
        const user = userModel.updatePassword(req.session.user.id, encryptedPassword);

        if(!user) {
            return res
                .status(404)
                .json(functions.baseResponse(status.NOT_FOUND_USER.message))
        }

        return res
            .status(200)
            .json(functions.baseResponse(status.OK.message, {'user_id': user.user_id}));

    } catch (e) {
        next(e);
    }
}

exports.withdraw = (req, res, next) => {
    try {
        // 유저 정보 삭제
        const result = userModel.delete(req.session.user.id);

        if (!result) {
            return res
                .status(404)
                .json(functions.baseResponse(status.NOT_FOUND_USER.message))
        }

        req.session.destroy((err) => {
            if (err) {
                return res
                    .status(500)
                    .json(functions.baseResponse(status.INTERNAL_SERVER_ERROR.message));
            }

            // 쿠키 제거
            res.cookie('session_id', null, {
                httpOnly: true,
                secure: false,
                maxAge: 0
            })
            res.cookie('user_id', null, {
                httpOnly: true,
                secure: false,
                maxAge: 0
            })
        })

        return res
            .status(204)
            .json(functions.baseResponse());

    } catch (e) {
        next(e);
    }
}

