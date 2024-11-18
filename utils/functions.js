const fs = require('fs');
const {data} = require("express-session/session/cookie");
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
        message: message,
        data: data
    }
}

exports.page = (offset, limit, total, data) => {
    return {
        offset: offset,
        limit: limit,
        total: total,
        data: data
    }
}

exports.pageResponse = (message='', offset, limit, total, data) => {
    return {
        message: message,
        offset: offset,
        limit: limit,
        total: total,
        data: data
    }
}

exports.formatDate = (date) => {
    return `${date.year}`
}