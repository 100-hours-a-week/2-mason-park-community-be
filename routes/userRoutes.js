const express = require('express');

const router = express.Router();
const uploader = require('../middlewares/uploadMiddleware');
const authenticator = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

router.post('/profile-image', uploader.single('profile_image'), userController.uploadProfileImage);
router.get('/me', authenticator.isAuthenticated, userController.getMyProfile);
router.patch('/me', authenticator.isAuthenticated, userController.updateMyProfile);
router.delete('/withdraw', authenticator.isAuthenticated, userController.withdraw);

module.exports = router;