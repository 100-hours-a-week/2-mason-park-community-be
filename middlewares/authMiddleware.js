const functions = require('../utils/functions');
const status = require('../utils/message');

exports.isAuthenticated = (req, res, next) => {
    try {
        if (!req.session || !req.session.user.is_authenticated) {
            return res
                .status(401)
                .json(functions.baseResponse(status.UNAUTHORIZED.message));
        }

        // TODO : 추가 보안 검증 (예: IP와 User-Agent 검증)

        // 인증 성공
        return next();
    } catch (error) {
        return res
            .status(500)
            .json(functions.baseResponse(status.INTERNAL_SERVER_ERROR.message));
    }
};

// TODO : 인가 미들웨어