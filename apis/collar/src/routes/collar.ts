import express from 'express';
import collarController from '../controllers/collarController.js';

const router = express.Router();

router.post('/', collarController.createCollar);
router.get('/:collarId', collarController.getCollar);
router.get('/', collarController.getAllCollars);
router.put('/:collarId', collarController.updateCollars);

export default router;