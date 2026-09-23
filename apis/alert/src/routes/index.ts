import express from 'express';
import alertRoutes from './alert.js';
import geofenceRoutes from './geofence.js';

const router = express.Router();

router.use('/alerts', alertRoutes);
router.use('/geofences', geofenceRoutes);

router.get('/version', (req, res) => {
    res.send(process.env.API_VERSION);
});

export default router;