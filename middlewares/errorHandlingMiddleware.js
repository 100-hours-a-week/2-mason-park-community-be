const response = require('../utils/response');
const {CustomError} = require("../utils/error");
const {SqlError} = require("mariadb");
const status = require("../utils/message");

exports.errorHandler = (err, req, res, next) => {
    if (err instanceof CustomError) {
        res
            .status(err.statusCode)
            .json(response.error(err.name, err.message));
    } else if (err instanceof SqlError) {
        console.log(err);
        res
            .status(500)
            .json(response.error('Internal Server Error', status.INTERNAL_SERVER_ERROR.message));
    } else {
        console.log(err);
        res
            .status(500)
            .json(response.error(err.name, err.message));
        }
}