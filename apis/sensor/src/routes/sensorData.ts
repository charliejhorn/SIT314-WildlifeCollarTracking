import express from 'express';
import sensorDataController from '../controllers/sensorDataController.js';

const router = express.Router();

router.post('/', sensorDataController.createSensorData);
router.get('/', sensorDataController.getSensorData);

export default router;