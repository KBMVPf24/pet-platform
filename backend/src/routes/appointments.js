const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { authenticate, authorize } = require('../middleware/auth');

// 所有路由都需要认证
router.use(authenticate);

// CRUD 路由
router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getAppointments);
router.get('/upcoming', appointmentController.getUpcomingAppointments);
router.get('/stats', appointmentController.getAppointmentStats);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/:id/cancel', appointmentController.cancelAppointment);

// 医院端操作
router.post('/:id/confirm', authenticate, authorize('admin', 'vet'), appointmentController.confirmAppointment);
router.post('/:id/complete', authenticate, authorize('admin', 'vet'), appointmentController.completeAppointment);

module.exports = router;
