import express from 'express';
import animalRoutes from './animal.js';

const router = express.Router();

router.use('/animals', animalRoutes);

router.get('/version', (req, res) => {
    res.send(process.env.API_VERSION);
});

export default router;