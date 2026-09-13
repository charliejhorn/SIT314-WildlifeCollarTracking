import express from 'express';
import alertController from '../controllers/alertController.js';

const router = express.Router();

router.post('/ingest', alertController.ingestReading)
router.get('/', alertController.listAlerts)
router.get('/:alertId', alertController.getAlertById)

// router.post('/', alertController.createalert);
// router.get('/:alertId', alertController.getalert);
// router.get('/', alertController.getAllalerts);
// router.put('/:alertId', alertController.updatealert);

export default router;