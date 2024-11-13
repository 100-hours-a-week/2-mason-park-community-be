const userModel = require('../models/userModel');
const functions = require("../utils/functions");
const validator = require("../utils/validator");
const crypto = require("crypto-js");
const CRYPTO_SECRET_KEY = process.env.CRYPTO_SECRET_KEY;

exports.login = (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = userModel.findUserByEmail(email);
        if (!user) {
            return res.status(404).json(functions.baseResponse("Not Found"))
        }

        const decryptedPassword = crypto.AES.decrypt(user.password, CRYPTO_SECRET_KEY);
        
        if (decryptedPassword.toString(crypto.enc.Utf8) !== password) {
            return res.status(401).json(functions.baseResponse("Unauthorized"));
        }

        // 로그인 성공 세션 저장 및 쿠키 설정
        req.session.user = {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            profile_image: user.profile_image
        };

        res.cookie('user_id', user.id, {
            httpOnly: true,
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json(functions.baseResponse("OK"));
    } catch (e) {
        next(e);
    }
}

exports.register = (req, res, next) => {
    try {
        const { email, password, nickname, profile_image } = req.body;

        // 유효성 검사
        const isValid = (
            email && validator.validateEmail(email)
            && password && validator.validatePassword(password)
            && nickname && validator.validateNickname(nickname)
        );

        if (!isValid) {
            return res.status(400).json(functions.baseResponse("Bad Request"));
        }

        // 이메일 중복 검사
        if (userModel.existsEmail(email)) {
            return res.status(409).json(functions.baseResponse("Email Conflict"));
        }

        // 닉네임 중복 검사
        if (userModel.existsNickname(nickname)) {
            return res.status(409).json(functions.baseResponse("Nickname Conflict"));
        }

        // 패스워드 암호화
        const encryptedPassword = crypto.AES.encrypt(password, CRYPTO_SECRET_KEY).toString();

        const user = userModel.save(
            email,
            encryptedPassword,
            nickname,
            profile_image
        );

        return res.status(201).json(functions.baseResponse("OK", {userId: user.id}));
    } catch (e) {
        next(e);
    }
}

exports.existsEmail = (req, res, next) => {
    try {
        const { email } = req.query;

        if (!userModel.existsEmail(email)) {
            return res.status(409).json(functions.baseResponse("Conflict"));
        }
        return res.status(200).json(functions.baseResponse("OK"));
    } catch (e) {
        next(e);
    }
}

exports.existsNickname = (req, res, next) => {
    try {
        const { nickname } = req.query

        if (!userModel.existsNickname(nickname)) {
            return res.status(409).json(functions.baseResponse("Conflict"));
        }
        return res.status(200).json(functions.baseResponse("OK"));
    } catch (e) {
        next(e);
    }
}