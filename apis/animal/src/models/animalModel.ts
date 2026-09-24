import { ObjectId } from 'mongodb';
import type { Document } from 'mongodb';
import { animalColl } from '../config/database.js';

export interface Animal {
    id?: number;
    name: string;
    species: string;
    birth_date: number;
}

const animalModel = {
    async create(animal: Animal): Promise<ObjectId> {
        const result = await animalColl.insertOne(animal);
        return result.insertedId;
    },

    async find(id: string): Promise<Document | null> {
        const query = { _id: new ObjectId(id) };
        const result = await animalColl.findOne(query);
        return result;
    },

    async findAll(): Promise<Document[]> {
        const result = await animalColl.find().toArray();
        return result;
    },

    async update(id: string, updates: Partial<Animal>): Promise<Document | null> {
        const result = await animalColl.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updates },  // Only updates provided fields
            { returnDocument: 'after' }
        );
        return result;
    },

    async findSpeciesOfAnimal(animal_id: string): Promise<string | null> {
        const query = { _id: new ObjectId(animal_id) };
        const result = await animalColl.findOne(query, { projection: { species: 1 } });
        return result ? result.species : null;
    }
};

export default animalModel;

