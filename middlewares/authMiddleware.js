const {status} = require('../utils/message');
const {UnauthorizedError} = require("../utils/error");

exports.isAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.user.is_authenticated) {
        throw new UnauthorizedError(status.UNAUTHORIZED.message);
    }

    // TODO : 추가 보안 검증 (예: IP와 User-Agent 검증)

    // 인증 성공
    return next();
};

exports.isAdmin = (req, res, next) => {
    if (!req.session || !req.session.user.is_authenticated || req.session.user.role !== 'ADMIN') {
        throw new UnauthorizedError(status.UNAUTHORIZED.message);
    }

    // 인증 성공
    return next();
};