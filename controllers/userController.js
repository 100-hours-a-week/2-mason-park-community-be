const model = require('../models/useModel');
const transaction = require('../db/transaction');
const path = require('path');
const validator = require("../utils/validator");
const crypto = require("crypto-js");
const status = require('../utils/message');
const response = require('../utils/response');
const {InternalServerError, NotFoundError, ValidationError} = require("../utils/error");

exports.uploadProfileImage = async (req, res, next) => {
    if (!req.file) {
        throw new ValidationError(status.BAD_REQUEST_IMAGE.message);
    }

    const imageUrl = path.join('/image/users/', req.file.filename);

    res
        .status(201)
        .json(response.base(status.CREATED_IMAGE.message, {
            'profile_image': imageUrl
        }));
}

exports.getMyProfile = async (req, res, next) => {
    return transaction(async (conn) => {
        const user = await model.findById(conn,req.session.user.user_id);

        // 유저가 존재하지 않을 경우 404
        if (!user) {
            throw new NotFoundError(status.NOT_FOUND_USER.message);
        }

        return res
            .status(200)
            .json(response.base(status.OK.message, {
                user_id: user.user_id,
                email: user.email,
                nickname: user.nickname,
                profile_image: user.profile_image,
                is_authenticated: !!req.session.user.is_authenticated,
            }));
    })
}

exports.updateMyProfile = async (req, res, next) => {
    return transaction(async (conn) => {
        const { profile_image, nickname } = req.body;

        // 닉네임 유효성 검사
        if (nickname && !validator.validateNickname(nickname)) {
            throw new ValidationError(status.BAD_REQUEST_NICKNAME.message);
        }

        const user = await model.findById(conn, req.session.user.user_id);

        if(!user) {
            throw new NotFoundError(status.NOT_FOUND_USER.message);
        }

        // 유저 정보 수정
        await model.updateProfile(
            conn,
            nickname ? nickname : user.nickname,
            profile_image ? profile_image : user.profile_image,
            user.user_id
        );

        return res
            .status(200)
            .json(response.base(status.OK.message, {'user_id': user.user_id}));
    })
}

exports.updatePassword = async (req, res, next) => {
    return transaction(async (conn) => {
        const { password } = req.body;

        // 비밃번호 유효성 검사
        if (!password) {
            throw new ValidationError(status.BAD_REQUEST_PASSWORD.message);
        }

        const decodedPassword = Buffer.from(password, "base64").toString("utf-8");

        if (!decodedPassword ||  !validator.validatePassword(decodedPassword)) {
            throw new ValidationError(status.BAD_REQUEST_PASSWORD.message);
        }

        const encryptedPassword = crypto.AES.encrypt(decodedPassword, process.env.CRYPTO_SECRET_KEY).toString();

        const user = await model.findById(conn,req.session.user.user_id);

        if(!user) {
            throw new NotFoundError(status.NOT_FOUND_USER.message);
        }

        // 비밀번호 수정
        await model.updatePassword(
            conn,
            encryptedPassword,
            user.user_id
        );

        return res
            .status(200)
            .json(response.base(status.OK.message, {'user_id': user.user_id}));
    })
}

exports.withdraw = async (req, res, next) => {
    return await transaction(async (conn) => {
        const user = await model.findById(conn,req.session.user.user_id);

        if(!user) {
            throw new NotFoundError(status.NOT_FOUND_USER.message);
        }

        await model.deleteById(conn,user.user_id);

        req.session.destroy((err) => {
            if (err) {
                next(new InternalServerError(status.INTERNAL_SERVER_ERROR.message));
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
            .send();
    })
}

