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
    async findAll(): Promise<SensorData[]> {
        return sensorDataColl.find<SensorData>({}).toArray();
    },
};

export default sensorDataModel;