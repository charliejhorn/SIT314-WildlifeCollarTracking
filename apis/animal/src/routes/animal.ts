import express from 'express';
import animalController from '../controllers/animalController.js';

const router = express.Router();

router.post('/', animalController.createAnimal);
router.get('/:animalId', animalController.getAnimal);
router.get('/', animalController.getAllAnimals);
router.put('/:animalId', animalController.updateAnimal);

export default router;