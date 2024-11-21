const userModel = require('../models/userModel');
const path = require('path');
const validator = require("../utils/validator");
const crypto = require("crypto-js");
const status = require('../utils/message');
const response = require('../utils/response');

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
    const user = userModel.findById(req.session.user.user_id);
    if (!user) {
        throw new NotFoundError(status.NOT_FOUND_USER.message);
    }

    return res
        .status(200)
        .json(response.base(status.OK.message, {
            ...user,
            is_authenticated: !!req.session.user.is_authenticated,
        }));
}

exports.updateMyProfile = async (req, res, next) => {
    const { profile_image, nickname } = req.body;

    // 유효성 검사
    if (!profile_image) {
        throw new ValidationError(status.BAD_REQUEST_IMAGE_URL.message);
    }

    if (!nickname || !validator.validateNickname(nickname)) {
        throw new ValidationError(status.BAD_REQUEST_NICKNAME.message);
    }

    // 유저 정보 수정
    const user = userModel.findById(req.session.user.user_id);
    if(!user) {
        throw new NotFoundError(status.NOT_FOUND_USER.message);
    }

    const updateUser = userModel.update(user.user_id, profile_image, nickname);

    return res
        .status(200)
        .json(response.base(status.OK.message, {'user_id': updateUser.user_id}));
}

exports.updatePassword = async (req, res, next) => {
    const { password } = req.body;

    // 유효성 검사
    if (!password) {
        throw new ValidationError(status.BAD_REQUEST_PASSWORD.message);
    }

    const decodedPassword = Buffer.from(password, "base64").toString("utf-8");
    if (!decodedPassword ||  !validator.validatePassword(decodedPassword)) {
        throw new ValidationError(status.BAD_REQUEST_PASSWORD.message);
    }

    // 유저 정보 수정
    const encryptedPassword = crypto.AES.encrypt(decodedPassword, process.env.CRYPTO_SECRET_KEY).toString();

    const user = userModel.findById(req.session.user.user_id);
    if(!user) {
        throw new NotFoundError(status.NOT_FOUND_USER.message);
    }

    const updateUser =  userModel.updatePassword(user.user_id, encryptedPassword);

    return res
        .status(200)
        .json(response.base(status.OK.message, {'user_id': updateUser.user_id}));
}

exports.withdraw = async (req, res, next) => {
    // 유저 정보 삭제
    const user = userModel.findById(req.session.user.user_id);

    if(!user) {
        throw new NotFoundError(status.NOT_FOUND_USER.message);
    }

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

    userModel.delete(user.user_id);

    return res
        .status(204);
}

