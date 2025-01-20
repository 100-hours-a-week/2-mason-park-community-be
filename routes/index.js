const express = require('express');

const router = express.Router();
const authenticator = require('../middlewares/authMiddleware');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const postRoutes = require('./postRoutes');
const commentRoutes = require('./commentRoutes');
const S3Routes = require('./S3Routes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/posts/:post_id', commentRoutes);
router.use('/s3', S3Routes);
router.use('/admin', authenticator.isAdmin, adminRoutes);

module.exports = router;