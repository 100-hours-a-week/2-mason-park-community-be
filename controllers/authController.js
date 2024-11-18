const userModel = require('../models/userModel');
const functions = require("../utils/functions");
const validator = require("../utils/validator");
const crypto = require("crypto-js");
const status = require("../utils/message");

exports.login = (req, res, next) => {
    try {
        const { email, password } = req.body;
        const decodedPassword = Buffer.from(password, "base64").toString("utf-8");

        const isValid = (
            email && validator.validateEmail(email)
            && decodedPassword && validator.validatePassword(decodedPassword)
        );

        if (!isValid) {
            return res
                .status(400)
                .json(functions.baseResponse(status.BAD_REQUEST.message))
        }

        const user = userModel.findByEmail(email);
        if (!user) {
            return res
                .status(404)
                .json(functions.baseResponse(status.NOT_FOUND_USER.message))
        }

        const decryptedPassword = crypto.AES.decrypt(user.password, process.env.CRYPTO_SECRET_KEY);
        if (decryptedPassword.toString(crypto.enc.Utf8) !== decodedPassword) {
            return res
                .status(401)
                .json(functions.baseResponse(status.UNAUTHORIZED.message));
        }

        // 로그인 성공 세션 저장 및 쿠키 설정
        req.session.user = {
            id: user.user_id,
            email: user.email,
            nickname: user.nickname,
            profile_image: user.profile_image
        };

        res.cookie('user_id', user.user_id, {
            httpOnly: true,
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res
            .status(200)
            .json(functions.baseResponse(status.OK.message));
    } catch (e) {
        next(e);
    }
}

exports.logout = (req, res, next) => {
    try {
        // 세션 제거
        req.session.destroy((err) => {
            if (err) {
                return res
                    .status(500)
                    .json(functions.baseResponse(status.INTERNAL_SERVER_ERROR.message));
            }

            // 쿠키 제거
            res.clearCookie('session_id', {
                httpOnly: true,
                secure: false,
                path: '/',
                maxAge: 0
            });
            res.clearCookie('user_id', {
                httpOnly: true,
                secure: false,
                path: '/',
                maxAge: 0
            });
        });

        return res
            .status(200)
            .json(functions.baseResponse(status.OK.message));
    } catch (e) {
        next(e);
    }
}

exports.register = (req, res, next) => {
    try {
        const { email, password, nickname, profile_image } = req.body;
        const decodedPassword = Buffer.from(password, "base64").toString("utf-8");

        // 유효성 검사
        const isValid = (
            email && validator.validateEmail(email)
            && decodedPassword && validator.validatePassword(decodedPassword)
            && nickname && validator.validateNickname(nickname)
        );

        if (!isValid) {
            return res
                .status(400)
                .json(functions.baseResponse(status.BAD_REQUEST.message));
        }

        // 이메일 중복 검사
        if (userModel.existsEmail(email)) {
            return res
                .status(409)
                .json(functions.baseResponse(status.CONFLICT_EMAIL.message));
        }

        // 닉네임 중복 검사
        if (userModel.existsNickname(nickname)) {
            return res
                .status(409)
                .json(functions.baseResponse(status.CONFLICT_NICKNAME.message));
        }

        // 패스워드 암호화
        const encryptedPassword = crypto.AES.encrypt(decodedPassword, process.env.CRYPTO_SECRET_KEY).toString();

        const user = userModel.save(
            email,
            encryptedPassword,
            nickname,
            profile_image
        );

        return res
            .status(201)
            .json(functions.baseResponse(status.CREATED_USER.message, {user_id: user.id}));
    } catch (e) {
        next(e);
    }
}

exports.existsEmail = (req, res, next) => {
    try {
        const { email } = req.query;

        if (userModel.existsEmail(email)) {
            return res
                .status(409)
                .json(functions.baseResponse(status.CONFLICT_EMAIL.message));
        }
        return res
            .status(200)
            .json(functions.baseResponse(status.OK.message));
    } catch (e) {
        next(e);
    }
}

exports.existsNickname = (req, res, next) => {
    try {
        const { nickname } = req.query

        if (userModel.existsNickname(nickname)) {
            return res
                .status(409)
                .json(functions.baseResponse(status.CONFLICT_NICKNAME.message));
        }
        return res
            .status(200)
            .json(functions.baseResponse(status.OK.message));
    } catch (e) {
        next(e);
    }
}