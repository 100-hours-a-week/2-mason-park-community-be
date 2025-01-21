const transaction = require("../db/transaction");
const {ValidationError, NotFoundError, UnauthorizedError} = require("../utils/error");
const status = require("../utils/message");
const userModel = require("../models/userModel");
const response = require("../utils/response");
const crypto = require("crypto-js");

exports.login = async (req, res, next) => {
    return await transaction(async(conn) => {
        const { email, password, secretKey } = req.body;

        // 이메일 유효성 검사
        if (!email) {
            throw new ValidationError(status.BAD_REQUEST_EMAIL.message);
        }

        // 패스워드 유효성 검사
        if (!password) {
            throw new ValidationError(status.BAD_REQUEST_PASSWORD.message);
        }

        const decodedPassword = Buffer.from(password, "base64").toString("utf-8");

        // 시크릿 키 검사
        if(!secretKey) {
            throw new ValidationError(status.BAD_REQUEST_SECRET_KEY.message);
        }

        const decodedSecretKey = Buffer.from(secretKey, "base64").toString("utf-8");

        if (decodedSecretKey !== process.env.ADMIN_SECRET_KEY) {
            throw new ValidationError(status.BAD_REQUEST_SECRET_KEY.message);
        }

        const user = await userModel.findByEmail(conn, email);

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
            is_authenticated: true,
            role: user.role
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


exports.getUsers = async (req, res, next) => {
    return await transaction(async (conn) => {
        const {offset, limit} = req.query;

        // 유효성 검사
        if (!offset || !limit) {
            throw new ValidationError(status.BAD_REQUEST_OFFSET_LIMIT.message);
        }

        const pagedUsers = await userModel.findAll(
            conn,
            parseInt(limit),
            parseInt(offset)
        );

        return res
            .status(200)
            .json(response.page(
                status.OK.message,
                pagedUsers.offset,
                pagedUsers.limit,
                pagedUsers.total,
                pagedUsers.data
            ));
    })
}