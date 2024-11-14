const functions = require('../utils/functions');
const status = require('../utils/message');
exports.isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }

    res
        .status(401)
        .json(functions.baseResponse(status.UNAUTHORIZED.message));
}

// TODO : 인가 미들웨어