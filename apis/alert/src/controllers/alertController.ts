import type { NextFunction, Request, Response } from 'express';
import alertModel, { type Alert, type AlertQuery } from '../models/alertModel.js';
import { SensorData } from '../types.js';


const alertController = {
    async ingestReading(req: Request, res: Response, next: NextFunction) {
        try {
            const sensorData: SensorData;
            const { ...(keyof typeof SensorData) } = req.query;
        } catch (error) {
            next(error);
        }
    },   
    
    async listAlerts(req: Request, res: Response, next: NextFunction) {
        try {
            const { collar_id, resolved } = req.query;
            const query: AlertQuery = {};

            if (collar_id !== undefined) {
                if (typeof collar_id !== 'string' || !/^\d+$/.test(collar_id)) {
                    return res.status(400).json({ error: 'collar_id must be a positive integer' });
                }
                query.collar_id = Number(collar_id);
            }

            if (resolved !== undefined) {
                if (typeof resolved !== 'string' || !['true', 'false'].includes(resolved)) {
                    return res.status(400).json({ error: 'resolved must be true or false' });
                }
                query.resolved = resolved === 'true';
            }

            const alerts = await alertModel.find(query);

            return res.status(200).json(alerts);
        } catch (error) {
            next(error);
        }
    },
    
    async getAlertById(req: Request<{ alertId: string }>, res: Response, next: NextFunction) {

    }
    
    // async createAlert(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         // validation happens here
    //         const { name, species, birth_date } = req.body;

    //         if (!name || !species || !birth_date) {
    //             return res.status(400).json({ 
    //                 error: 'Missing required fields' 
    //             });
    //         }

    //         // data access happens in the model
    //         const alert: Alert = { name, species, birth_date };
    //         const insertedId = await alertModel.create(alert);

    //         res.status(201).json({ ...alert });
    //     } catch (error) {
    //         next(error);
    //     }
    // },

    // async getAlert(_req: Request<{ alertId: string}>, res: Response, next: NextFunction) {
    //     try {
    //         const { alertId } = _req.params;

    //         if (typeof alertId !== 'string' || !alertId) {
    //             return res.status(400).json({ error: 'id is required' });
    //         }

    //         const data = await alertModel.find(alertId);
            
    //         return res.status(200).json(data);
    //     } catch (error) {
    //         next(error);
    //     }
    // },

    // async getAllalerts(_req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const data = await alertModel.findAll();
    //         return res.status(200).json(data);
    //     } catch (error) {
    //         next(error);
    //     }
    // },

    // async updatealert(req: Request<{ alertId: string }>, res: Response) {
    //     const { alertId } = req.params;
    //     const { name, birth_date, species } = req.body;  // Only allow certain fields
        
    //     const updates: Partial<Alert> = {};
    //     if (name !== undefined) updates.name = name;
    //     if (birth_date !== undefined) updates.birth_date = birth_date;
    //     if (species !== undefined) updates.species = species;
        
    //     const result = await alertModel.update(alertId, updates);
    //     res.status(200).json(result);
    // }
};

export default alertController;