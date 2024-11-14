const userModel = require('../models/userModel');
const functions = require('../utils/functions');
const status = require('../utils/message');

exports.getMyProfile = (req, res, next) => {
    try {
        const sessionUser = req.session.user;

        if (!sessionUser) {
            return res
                .status(401)
                .json(functions.baseResponse(status.UNAUTHORIZED.message))
        }

        return res
            .status(200)
            .json(functions.baseResponse(status.OK.message, {
                'user_id': sessionUser.id,
                'email': sessionUser.email,
                'nickname': sessionUser.nickname,
                'profile_image': sessionUser.profile_image
            }))
    } catch (e) {
        next(e);
    }
}