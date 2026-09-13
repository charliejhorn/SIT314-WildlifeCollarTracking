import express from 'express';
import alertRoutes from './alert.js';
import zoneRoutes from './zone.js';

const router = express.Router();

router.use('/alerts', alertRoutes);
router.use('/zones', zoneRoutes);

router.get('/version', (req, res) => {
    res.send(process.env.API_VERSION);
});

export default router;