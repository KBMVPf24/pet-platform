const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth');

// 公开路由
router.post('/register', authController.register);
router.post('/login', authController.login);

// 需要认证的路由
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateProfile);
router.post('/change-password', authenticate, authController.changePassword);

// 管理员路由
router.get('/users', authenticate, authorize('admin'), authController.getUsers);
router.put('/users/:id/role', authenticate, authorize('admin'), authController.updateUserRole);

module.exports = router;
