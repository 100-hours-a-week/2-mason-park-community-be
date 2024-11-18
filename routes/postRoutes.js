const express = require('express');

const router = express.Router();
const uploader = require('../middlewares/uploadMiddleware');
const authenticator = require('../middlewares/authMiddleware');
const postController = require('../controllers/postController');

router.post('/', authenticator.isAuthenticated, uploader.fields([{ name: 'post_image' }, { name: 'data' }]), postController.createPost);
router.get('/', postController.getPosts);
router.get('/:post_id', postController.getPost);
router.patch('/:post_id', authenticator.isAuthenticated, uploader.fields([{ name: 'post_image' }, { name: 'data' }]), postController.updatePost);
module.exports = router;