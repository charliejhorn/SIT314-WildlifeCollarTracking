import type { NextFunction, Request, Response } from 'express';
import sensorDataModel, { type SensorData } from '../models/sensorDataModel.js';

const sensorDataController = {
  async createSensorData(req: Request, res: Response, next: NextFunction) {
    try {
      // Validation happens here
      const { posix_time, collar_id, gps, vitals, accelerometer } = req.body;

      if (!posix_time || !collar_id || !gps || !vitals || !accelerometer) {
        return res.status(400).json({ 
          error: 'Missing required fields' 
        });
      }

      // Data access happens in the model
      const sensorData: SensorData = { posix_time, collar_id, gps, vitals, accelerometer };
      const insertedId = await sensorDataModel.create(sensorData);

      res.status(201).json({ id: insertedId, ...sensorData });
    } catch (error) {
      next(error);
    }
  },

  async getSensorData(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await sensorDataModel.findAll();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },
};

export default sensorDataController;