const validator = require("../utils/validator");
const response = require('../utils/response');
const crypto = require("crypto-js");
const status = require("../utils/message");
const {ValidationError, NotFoundError, UnauthorizedError, InternalServerError, ConflictError} = require("../utils/error");
const transaction = require("../db/transaction");
const userModel = require("../models/useModel");

exports.login = async (req, res, next) => {
    return await transaction(async(conn) => {
        const { email, password } = req.body;

        // 이메일 유효성 검사
        if (!email || !validator.validateEmail(email)) {
            throw new ValidationError(status.BAD_REQUEST_EMAIL.message);
        }

        // 패스워드 유효성 검사
        if (!password) {
            throw new ValidationError(status.BAD_REQUEST_PASSWORD.message);
        }

        const decodedPassword = Buffer.from(password, "base64").toString("utf-8");

        if (!validator.validatePassword(decodedPassword)) {
            throw new ValidationError(status.BAD_REQUEST_PASSWORD.message);
        }

        const user = await userModel.findByEmail(conn, email);
        console.log(user);
        if (!user) {
            throw new NotFoundError(status.NOT_FOUND_USER.message);
        }

        const decryptedPassword = crypto.AES.decrypt(user.password, process.env.CRYPTO_SECRET_KEY);

        if (decryptedPassword.toString(crypto.enc.Utf8) !== decodedPassword) {
            throw new UnauthorizedError(status.UNAUTHORIZED.message);
        }

        // 로그인 성공 세션 저장 및 쿠키 설정
        req.session.user = {
            user_id: user.user_id,
            is_authenticated: true
        };

        res.cookie('user_id', user.user_id, {
            httpOnly: true,
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res
            .status(200)
            .json(response.base(status.OK.message));
    })
}

exports.logout = async (req, res, next) => {
    // 세션 제거
    req.session.destroy((err) => {
        if (err) {
            next(new InternalServerError(status.INTERNAL_SERVER_ERROR_SESSION_DESTROY.message));
        }

    });

    // 쿠키 제거
    res.clearCookie('session_id', {
        httpOnly: true,
        secure: false,
        path: '/',
    });
    res.clearCookie('user_id', {
        httpOnly: true,
        secure: false,
        path: '/',
    });

    return res
        .status(200)
        .json(response.base(status.OK.message));
}

exports.register = async (req, res, next) => {
    return await transaction(async (conn) => {
        const { email, password, nickname, profile_image } = req.body;

        // 이메일 유효성 검사
        if (!email || !validator.validateEmail(email)) {
            throw new ValidationError(status.BAD_REQUEST_EMAIL.message);
        }

        // 비밀번호 유효성 검사
        if (!password) {
            throw new ValidationError(status.BAD_REQUEST_PASSWORD.message);
        }

        const decodedPassword = Buffer.from(password, "base64").toString("utf-8");

        if (!validator.validatePassword(decodedPassword)) {
            throw new ValidationError(status.BAD_REQUEST_PASSWORD.message);
        }

        // 닉네임 유효성 검사
        if (!nickname || !validator.validateNickname(nickname)) {
            throw new ValidationError(status.BAD_REQUEST_NICKNAME.message);
        }

        //  이메일 중복 검사
        if (await userModel.existsEmail(conn,email)) {
            throw new ConflictError(status.CONFLICT_EMAIL.message);
        }

        // 닉네임 중복 검사
        if (await userModel.existsNickname(conn,nickname)) {
            throw new ConflictError(status.CONFLICT_NICKNAME.message);
        }

        // 패스워드 암호화
        const encryptedPassword = crypto.AES.encrypt(decodedPassword, process.env.CRYPTO_SECRET_KEY).toString();

        // 저장
        const result = await userModel.save(
            conn,
            email,
            encryptedPassword,
            nickname,
            profile_image
        );

        return res
            .status(201)
            .json(response.base(status.CREATED_USER.message, {user_id: Number(result.insertId)}));
    })
}

exports.existsEmail = async (req, res, next) => {
    return await transaction(async (conn) => {
        const { email } = req.query;

        if (await userModel.existsEmail(conn,email)) {
            throw new ConflictError(status.CONFLICT_EMAIL.message);
        }

        return res
            .status(200)
            .json(response.base(status.OK.message));
    })

}

exports.existsNickname = async (req, res, next) => {
    return await transaction(async (conn) => {
        const { nickname } = req.query;

        if (await userModel.existsNickname(conn, nickname)) {
            throw new ConflictError(status.CONFLICT_NICKNAME.message);
        }

        return res
            .status(200)
            .json(response.base(status.OK.message));
    })
}