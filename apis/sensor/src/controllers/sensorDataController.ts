import type { NextFunction, Request, Response } from 'express';
import sensorDataModel, { type SensorData } from '../models/sensorDataModel.js';

const sensorDataController = {
    async createSensorData(req: Request, res: Response, next: NextFunction) {
        try {
            // validation happens here
            const { posix_time, collar_id, gps, vitals, accelerometer, seq } = req.body;

            if (!posix_time || !collar_id || !gps || !vitals || !accelerometer) {
                return res.status(400).json({ 
                    error: 'Missing required fields' 
                });
            }
            if (!gps.lat || !gps.lon || !gps.hdop || !gps.satellites || !gps.fixQuality) {
                return res.status(400).json({
                    error: 'Missing required gps fields'
                })
            }
            if (!vitals.body_temp || !vitals.heart_rate) {
                if (!vitals.body_temp.min || !vitals.body_temp.max || !vitals.body_temp.avg) {
                    return res.status(400).json({
                        error: 'Missing required vitals.body_temp fields'
                    })
                }
                if (!vitals.heart_rate.min || !vitals.heart_rate.max || !vitals.heart_rate.avg) {
                    return res.status(400).json({
                        error: 'Missing required vitals.heart_rate fields'
                    })
                }
            }
            if(!accelerometer.x || !accelerometer.y || !accelerometer.z || !accelerometer.samples) {
                if (!accelerometer.x.min || !accelerometer.x.max || !accelerometer.x.avg) {
                    return res.status(400).json({
                        error: 'Missing required accelerometer.x fields'
                    })
                }
                if (!accelerometer.y.min || !accelerometer.y.max || !accelerometer.y.avg) {
                    return res.status(400).json({
                        error: 'Missing required accelerometer.y fields'
                    })
                }
                if (!accelerometer.z.min || !accelerometer.z.max || !accelerometer.z.avg) {
                    return res.status(400).json({
                        error: 'Missing required accelerometer.z fields'
                    })
                }
                for (const sample of accelerometer.samples) {
                    if (!sample.x || !sample.y || !sample.z) {
                        return res.status(400).json({
                            error: 'Missing required sample value within accelerometer.samples'
                        })
                    }
                }
            }
            const received_posix_time = Date.now();

            // data access happens in the model
            const sensorData: SensorData = { generated_posix_time: posix_time, received_posix_time, collar_id, gps, vitals, accelerometer, seq: seq || 9999999 };
            const insertedId = await sensorDataModel.create(sensorData);

            res.status(201).json({ id: insertedId, ...sensorData });
        } catch (error) {
            next(error);
        }
    },

    async getSensorDataByCollar(_req: Request, res: Response, next: NextFunction) {
        try {
            const { collar_id } = _req.query;

            if (typeof collar_id !== 'string' || !collar_id) {
                return res.status(400).json({ error: 'collar_id is required' });
            }

            const data = await sensorDataModel.findByCollarId(collar_id);
            
            return res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    },
};

export default sensorDataController;