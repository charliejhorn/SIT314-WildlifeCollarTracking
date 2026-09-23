import express from 'express';
import geofenceController from '../controllers/geofenceController.js';

const router = express.Router();

router.post('/', geofenceController.createGeofence);
router.get('/', geofenceController.listGeofences);
router.get('/collars/:collar_id/geofence', geofenceController.getGeofenceForCollar);
router.post('/collars/:collar_id/geofence', geofenceController.assignCollarToGeofence);
router.get('/:geofenceId', geofenceController.getGeofenceById);
router.put('/:geofenceId', geofenceController.updateGeofence);
router.delete('/:geofenceId', geofenceController.deleteGeofence);

export default router;