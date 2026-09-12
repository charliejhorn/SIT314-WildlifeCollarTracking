import type { NextFunction, Request, Response } from 'express';
import animalModel, { type Animal } from '../models/animalModel.js';

const animalController = {
    async createAnimal(req: Request, res: Response, next: NextFunction) {
        try {
            // validation happens here
            const { name, species, birth_date } = req.body;

            if (!name || !species || !birth_date) {
                return res.status(400).json({ 
                    error: 'Missing required fields' 
                });
            }

            // data access happens in the model
            const animal: Animal = { name, species, birth_date };
            const insertedId = await animalModel.create(animal);

            res.status(201).json({ ...animal });
        } catch (error) {
            next(error);
        }
    },

    async getAnimal(_req: Request<{ animalId: string}>, res: Response, next: NextFunction) {
        try {
            const { animalId } = _req.params;

            if (typeof animalId !== 'string' || !animalId) {
                return res.status(400).json({ error: 'id is required' });
            }

            const data = await animalModel.find(animalId);
            
            return res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    },

    async getAllAnimals(_req: Request, res: Response, next: NextFunction) {
        try {
            const data = await animalModel.findAll();
            return res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    },

    async updateAnimal(req: Request<{ animalId: string }>, res: Response) {
        const { animalId } = req.params;
        const { name, birth_date, species } = req.body;  // Only allow certain fields
        
        const updates: Partial<Animal> = {};
        if (name !== undefined) updates.name = name;
        if (birth_date !== undefined) updates.birth_date = birth_date;
        if (species !== undefined) updates.species = species;
        
        const result = await animalModel.update(animalId, updates);
        res.status(200).json(result);
    }
};

export default animalController;