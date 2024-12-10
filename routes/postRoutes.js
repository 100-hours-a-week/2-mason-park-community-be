const express = require('express');

const router = express.Router();
const uploader = require('../middlewares/uploadMiddleware');
const authenticator = require('../middlewares/authMiddleware');
const postController = require('../controllers/postController');

router.post('/', authenticator.isAuthenticated, postController.createPost);
router.get('/', postController.getPosts);
router.get('/:post_id', postController.getPost);
router.patch('/:post_id', authenticator.isAuthenticated, postController.updatePost);
router.delete('/:post_id', authenticator.isAuthenticated, postController.deletePost);
module.exports = router;