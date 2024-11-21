const status = require('../utils/message');

exports.isAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.user.is_authenticated) {
        throw new UnauthorizedError(status.UNAUTHORIZED.message);
    }

    // TODO : 추가 보안 검증 (예: IP와 User-Agent 검증)

    // 인증 성공
    return next();
};