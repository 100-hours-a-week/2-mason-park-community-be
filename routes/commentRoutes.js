const express = require('express');

const router = express.Router({ mergeParams: true });
const authenticator = require('../middlewares/authMiddleware');
const commentController = require('../controllers/commentController');

router.post('/comments', authenticator.isAuthenticated, commentController.createComment);
router.get('/comments', commentController.getComments);
router.patch('/comments/:comment_id', authenticator.isAuthenticated, commentController.updateComment);
module.exports = router;