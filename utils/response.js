const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Seoul');

exports.base = (message='', data) => {
    return {
        message: message,
        data: data
    }
}

exports.page = (message='', offset, limit, total, data) => {
    return {
        message: message,
        offset: offset,
        limit: limit,
        total: total,
        data: data
    }
}

exports.error = (error, message='') => {
    return {
        error: error,
        message: message
    }
}

exports.time = (time, format='YYYY-MM-DD HH:mm:ss') => {
    return moment(time).format(format);
}