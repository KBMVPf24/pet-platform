const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospital.controller');
const { authenticate, authorize } = require('../middleware/auth');

// 公开路由
router.get('/', hospitalController.getHospitals);
router.get('/search', hospitalController.searchHospitals);
router.get('/nearby', hospitalController.getNearbyHospitals);
router.get('/:id', hospitalController.getHospitalById);

// 需要认证的路由
router.post('/', authenticate, authorize('admin'), hospitalController.createHospital);
router.put('/:id', authenticate, authorize('admin'), hospitalController.updateHospital);

module.exports = router;
