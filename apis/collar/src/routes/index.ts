import express from 'express';
import collarRoutes from './collar.js';

const router = express.Router();

router.use('/collars', collarRoutes);

router.get('/version', (req, res) => {
    res.send(process.env.API_VERSION);
});

export default router;