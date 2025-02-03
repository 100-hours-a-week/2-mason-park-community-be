const express = require('express');

const router = express.Router();
const authenticator = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');

router.get('/subscribe', authenticator.isAuthenticated, notificationController.subscribeNotification)
router.get('/', authenticator.isAuthenticated, notificationController.getNotifications)
router.delete('/:notification_id', authenticator.isAuthenticated, notificationController.deleteNotification)
router.patch('/:notification_id/read', authenticator.isAuthenticated, notificationController.readNotification)

module.exports = router;