const userModel = require('../models/userModel');
const functions = require("../utils/functions");
const validator = require("../utils/validator");
const crypto = require("crypto-js");
const CRYPTO_SECRET_KEY = process.env.CRYPTO_SECRET_KEY;

exports.login = (req, res) => {
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

        return res.status(200).json(functions.baseResponse("OK"));
    } catch (e) {
        return res.status(500).json(functions.baseResponse("Internal Server Error"));
    }
}

exports.register = (req, res) => {
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

        const encryptedPassword = crypto.AES.encrypt(password, CRYPTO_SECRET_KEY).toString();
        console.log(encryptedPassword);
        const user = userModel.save(
            email,
            encryptedPassword,
            nickname,
            profile_image
        );

        return res.status(200).json(functions.baseResponse("OK", {userId: user.id}));
    } catch (e) {
        console.log(e);
        return res.status(500).json(functions.baseResponse("Internal Server Error"));
    }
}

exports.existsEmail = (res, req) => {
    try {
        const { email } = req.params.email;

        if (!userModel.existEmail(email)) {
            return res.status(409).json(functions.baseResponse("Conflict"));
        }
        return res.status(200).json(functions.baseResponse("OK"));
    } catch (e) {
        return res.status(500).json(functions.baseResponse("Internal Server Error"));
    }
}

exports.existsNickname = (res, req) => {
    try {
        const { nickname } = req.params.nickname;

        if (!userModel.existNickname(nickname)) {
            return res.status(409).json(functions.baseResponse("Conflict"));
        }
        return res.status(200).json(functions.baseResponse("OK"));
    } catch (e) {
        return res.status(500).json(functions.baseResponse("Internal Server Error"));
    }
}