const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth');

// 所有路由都需要认证
router.use(authenticate);

// CRUD 路由
router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/stats', orderController.getOrderStats);
router.get('/:id', orderController.getOrderById);
router.post('/:id/cancel', orderController.cancelOrder);
router.post('/:id/pay', orderController.payOrder);
router.post('/:id/complete', orderController.completeOrder);

module.exports = router;
