import express from 'express';
import sensorDataRoutes from './sensorData.js';

const router = express.Router();

router.use('/sensor-data', sensorDataRoutes);

router.get('/version', (req, res) => {
    res.send(process.env.API_VERSION);
});

export default router;