const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/register', authController.register);
router.get('/emails/exist', authController.existsEmail);
router.get('/nicknames/exist', authController.existsNickname);

module.exports = router;