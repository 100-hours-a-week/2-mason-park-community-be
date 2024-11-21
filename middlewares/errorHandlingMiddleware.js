const response = require('../utils/response');

exports.errorHandler = (err, req, res, next) => {
    if (err instanceof CustomError) {
        res
            .status(err.statusCode)
            .json(response.error(err.name, err.message));
    } else {
        res
            .status(500)
            .json(response.error(err.name, err.message));
        }
}