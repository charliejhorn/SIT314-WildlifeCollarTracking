import express from 'express';
import geofenceController from '../controllers/geofenceController.js';

const router = express.Router();

router.post('/', geofenceController.createZone);
router.get('/', geofenceController.listZones);
router.get('/collars/:collar_id/zone', geofenceController.getZoneForCollar);
router.post('/collars/:collar_id/zone', geofenceController.assignCollarToZone);
router.get('/:zoneId', geofenceController.getZoneById);
router.put('/:zoneId', geofenceController.updateZone);
router.delete('/:zoneId', geofenceController.deleteZone);

export default router;