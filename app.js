const express = require('express');

const app = express();

// Middleware 설정
app.use(express.json());

// Route 설정
const router = require('./routes/index');
app.use('/api', router);

module.exports = app;