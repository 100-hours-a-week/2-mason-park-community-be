const fs = require('fs');
const ENCODING_FORMAT = 'utf-8';

exports.readDB = (path) => {
    return JSON.parse(
        fs.readFileSync(path, ENCODING_FORMAT)
    )
}

exports.writeDB = (path, data) => {
    fs.writeFileSync(path, JSON.stringify(data, null, 2), ENCODING_FORMAT);
}

exports.baseResponse = (message='', data) => {
    return {
        "message" : message,
        "data" : data
    }
}