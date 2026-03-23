const express = require('express');
const router = express.Router();
const petController = require('../controllers/pet.controller');
const { authenticate } = require('../middleware/auth');

// 所有路由都需要认证
router.use(authenticate);

// CRUD 路由
router.post('/', petController.createPet);
router.get('/', petController.getUserPets);
router.get('/stats', petController.getPetStats);
router.get('/:id', petController.getPetById);
router.put('/:id', petController.updatePet);
router.delete('/:id', petController.deletePet);

module.exports = router;
