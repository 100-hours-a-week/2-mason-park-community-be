const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/email/exist', authController.existsEmail);
router.get('/nickname/exist', authController.existsNickname);

module.exports = router;