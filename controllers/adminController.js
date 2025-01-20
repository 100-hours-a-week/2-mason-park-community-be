const transaction = require("../db/transaction");
const {ValidationError} = require("../utils/error");
const status = require("../utils/message");
const userModel = require("../models/userModel");
const response = require("../utils/response");


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