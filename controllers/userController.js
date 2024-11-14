const userModel = require('../models/userModel');
const functions = require('../utils/functions');
const status = require('../utils/message');
const path = require('path');

exports.uploadProfileImage = (req, res, next) => {
    try {
        if (!req.file) {
            return res
                .status(400)
                .json(functions.baseResponse(status.BAD_REQUEST_IMAGE.message));
        }

        const imageUrl = path.join(process.cwd(), '/db/images/', req.file.filename);

        res
            .status(201)
            .json(functions.baseResponse(status.CREATED_IMAGE.message, {
                'profile_image': imageUrl
            }));
    } catch (e) {
        next(e);
    }
}

exports.getMyProfile = (req, res, next) => {
    try {
        return res
            .status(200)
            .json(functions.baseResponse(status.OK.message, {
                'user_id': req.session.user.id,
                'email': req.session.user.email,
                'nickname': req.session.user.nickname,
                'profile_image': req.session.user.profile_image
            }))
    } catch (e) {
        next(e);
    }
}



