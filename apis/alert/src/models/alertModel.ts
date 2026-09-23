import { ObjectId } from 'mongodb';
import type { Document } from 'mongodb';
import { alertColl } from '../config/database.js';

export interface Alert {
    id?: number;
    collar_id: number;
    animal_id?: number;
    type: 'geofence' | 'vitals' | 'no_movement';
    severity: 'warning' | 'critical';
    triggered_at: number;
    last_notified_at: number;
    resolved_at?: number;
    resolved?: boolean;
    details?: Record<string, unknown>;
}

export interface AlertQuery {
    collar_id?: number;
    resolved?: boolean;
}

const alertModel = {
    async create(alert: Alert): Promise<ObjectId> {
        const result = await alertColl.insertOne(alert);
        return result.insertedId;
    },

    async findAlertById(id: string): Promise<Document | null> {
        const result = await alertColl.find({ _id: new ObjectId(id) });
        return result;
    },

    async findAll(): Promise<Document[]> {
        const result = await alertColl.find().toArray();
        return result;
    },

    async update(id: string, updates: Partial<Alert>): Promise<Document | null> {
        const result = await alertColl.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updates },  // Only updates provided fields
            { returnDocument: 'after' }
        );
        return result;
    },

    async find(query: AlertQuery): Promise<Document[]> {
        const result = await alertColl.find(query).toArray();
        return result;
    }
};

export default alertModel;

