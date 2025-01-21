const express = require('express');

const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticator = require('../middlewares/authMiddleware');

router.get('/users', authenticator.isAdmin, adminController.getUsers);
router.delete('/users/:user_id', authenticator.isAdmin, adminController.deleteUser);
router.post('/login', adminController.login);

module.exports = router;