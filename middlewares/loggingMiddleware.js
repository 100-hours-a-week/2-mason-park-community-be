const morgan = require('morgan');
const moment = require('moment');

morgan.token('date', function(req, res, next){
    return moment().format('YYYY-MM-DD HH:mm:ss');
})

module.exports = morgan('[:date] :method :url HTTP/:http-version :status :res[content-length]');
