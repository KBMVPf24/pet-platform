const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth');

// 公开路由
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);

// 需要认证的路由
router.post('/', authenticate, authorize('admin', 'breeder'), productController.createProduct);
router.put('/:id', authenticate, authorize('admin', 'breeder'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('admin', 'breeder'), productController.deleteProduct);

module.exports = router;
