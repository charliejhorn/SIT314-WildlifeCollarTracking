import { ObjectId } from 'mongodb';
import type { Document } from 'mongodb';
import { collarsColl } from '../config/database.js';

export interface Collar {
    id?: number,
    animal_id: number;
    fitted_date?: number;
}

const collarModel = {
    async create(collar: Collar): Promise<ObjectId> {
        const result = await collarsColl.insertOne(collar);
        return result.insertedId;
    },

    async find(id: string): Promise<Document | null> {
        const query = { _id: new ObjectId(id) };
        const result = await collarsColl.findOne(query);
        return result;
    },

    async findAll(): Promise<Document[]> {
        const result = await collarsColl.find().toArray();
        return result;
    },

    async update(id: string, updates: Partial<Collar>): Promise<Document | null> {
        const result = await collarsColl.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updates },  // Only updates provided fields
            { returnDocument: 'after' }
        );
        return result;
    },
};

export default collarModel;

