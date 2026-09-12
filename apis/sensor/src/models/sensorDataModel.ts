import type { ObjectId } from 'mongodb';
import { sensorDataColl } from '../config/database.js';

export interface SensorData {
    posix_time: number;
    collar_id: string;
    gps: Record<string, unknown>;
    vitals: Record<string, unknown>;
    accelerometer: Record<string, unknown>;
}

const sensorDataModel = {
    async create(sensorData: SensorData): Promise<ObjectId> {
        const result = await sensorDataColl.insertOne(sensorData);
        return result.insertedId;
    },
    async findByCollarId(collar_id: string): Promise<SensorData[]> {
        return await sensorDataColl
            .find<SensorData>({ collar_id: parseInt(collar_id) })
            .toArray();
    },
};

export default sensorDataModel;