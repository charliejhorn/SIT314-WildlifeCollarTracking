import type { ObjectId } from 'mongodb';
import { sensorDataColl } from '../config/database.js';

export interface SensorData {
    generated_posix_ms: number;
    received_posix_ms: number;
    collar_id: number;
    gps: Record<string, unknown>;
    vitals: Record<string, unknown>;
    accelerometer: Record<string, unknown>;
    seq: number;
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