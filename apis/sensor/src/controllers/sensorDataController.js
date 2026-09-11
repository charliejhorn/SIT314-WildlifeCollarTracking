import sensorDataModel from '../models/sensorDataModel.js';

const sensorDataController = {
  async createSensorData(req, res, next) {
    try {
      // Validation happens here
      const { posix_time, collar_id, gps, vitals, accelerometer } = req.body;

      if (!posix_time || !collar_id || !gps || !vitals || !accelerometer) {
        return res.status(400).json({ 
          error: 'Missing required fields' 
        });
      }

      // Data access happens in the model
      const sensorData = { posix_time, collar_id, gps, vitals, accelerometer };
      const insertedId = await sensorDataModel.create(sensorData);

      res.status(201).json({ id: insertedId, ...sensorData });
    } catch (error) {
      next(error);
    }
  },

  async getSensorData(req, res, next) {
    try {
      const data = await sensorDataModel.findAll();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },
};

export default sensorDataController;