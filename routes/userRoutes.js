const express = require('express');

const router = express.Router();
const uploader = require('../middlewares/uploadMiddleware');
const authenticator = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

router.get('/me', authenticator.isAuthenticated, userController.getMyProfile);
router.post('/profile-image', uploader.single('profile_image'), userController.uploadProfileImage);

module.exports = router;