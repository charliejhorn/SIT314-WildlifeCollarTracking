import type { NextFunction, Request, Response } from 'express';
import collarModel, { type Collar } from '../models/collarModel.js';

const collarController = {
    async createCollar(req: Request, res: Response, next: NextFunction) {
        try {
            // validation happens here
            const { fitted_date, animal_id } = req.body;

            if (animal_id === undefined) {
                return res.status(400).json({ error: 'animal_id is required' });
            }

            const collar: Collar = {animal_id};

            // fitted_date is not required on creation
            if(fitted_date !== undefined) {
                collar.fitted_date = fitted_date;
            }

            // data access happens in the model
            const insertedId = await collarModel.create(collar);

            res.status(201).json({ ...collar });
        } catch (error) {
            next(error);
        }
    },

    async getCollar(_req: Request<{ collarId: string}>, res: Response, next: NextFunction) {
        try {
            const { collarId } = _req.params;

            if (typeof collarId !== 'string' || !collarId) {
                return res.status(400).json({ error: 'id is required' });
            }

            const data = await collarModel.find(collarId);
            
            return res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    },

    async getAllCollars(_req: Request, res: Response, next: NextFunction) {
        try {
            const data = await collarModel.findAll();
            return res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    },

    async updateCollars(req: Request<{ collarId: string }>, res: Response) {
        const { collarId } = req.params;
        const { animal_id, fitted_date } = req.body;  // Only allow certain fields
        
        const updates: Partial<Collar> = {};
        if (animal_id !== undefined) updates.animal_id = animal_id;
        if (fitted_date !== undefined) updates.fitted_date = fitted_date;
        
        const result = await collarModel.update(collarId, updates);
        res.status(200).json(result);
    }
};

export default collarController;