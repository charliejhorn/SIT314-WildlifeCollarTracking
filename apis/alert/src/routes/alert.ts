import express from 'express';
import alertController from '../controllers/alertController.js';

const router = express.Router();

router.post('/ingest', alertController.ingestReading)
router.get('/', alertController.listAlertsByCollar)
router.get('/:alertId', alertController.getAlertById)

export default router;