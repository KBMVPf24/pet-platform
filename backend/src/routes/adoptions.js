const express = require('express');
const router = express.Router();
const adoptionController = require('../controllers/adoption.controller');
const { authenticate } = require('../middleware/auth');

// 公开路由
router.get('/', adoptionController.getAdoptions);
router.get('/search', adoptionController.searchAdoptions);
router.get('/stats', adoptionController.getAdoptionStats);
router.get('/:id', adoptionController.getAdoptionById);

// 需要认证的路由
router.post('/', authenticate, adoptionController.createAdoption);
router.post('/:id/apply', authenticate, adoptionController.applyAdoption);
router.post('/:id/confirm', authenticate, adoptionController.confirmAdoption);
router.post('/:id/cancel', authenticate, adoptionController.cancelAdoption);
router.delete('/:id', authenticate, adoptionController.deleteAdoption);
router.get('/my/published', authenticate, adoptionController.getMyAdoptions);

module.exports = router;
