const response = require('../utils/response');
const {CustomError} = require("../utils/error");

exports.errorHandler = (err, req, res, next) => {
    if (err instanceof CustomError) {
        res
            .status(err.statusCode)
            .json(response.error(err.name, err.message));
    } else {
        console.log(err);
        res
            .status(500)
            .json(response.error(err.name, err.message));
        }
}