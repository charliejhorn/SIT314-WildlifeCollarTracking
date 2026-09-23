import { ObjectId } from 'mongodb';
import { geofenceColl, collarGeofenceAssignmentColl } from '../config/database.js';

export interface Geofence {
    id?: number;
    name: string;
    boundary: { center: { lat: number; lon: number }; radius_m: number };
}

export const geofenceModel = {
    async create(geofence: Geofence) {
        const result = await geofenceColl.insertOne(geofence);
        return result.insertedId;
    },

    async findGeofenceById(id: string): Promise<Geofence | null> {
        if (!ObjectId.isValid(id)) return null;
        return geofenceColl.findOne({ _id: new ObjectId(id) }) as Promise<Geofence | null>;
    },

    async findAll() {
        const result = await geofenceColl.find().toArray();
        return result;
    },

    async update(id: string, updates: Partial<Geofence>) {
        const result = await geofenceColl.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updates },
            { returnDocument: 'after' }
        );
        return result;
    },

    async delete(id: string) {
        return geofenceColl.deleteOne({ _id: new ObjectId(id) });
    },
}


export interface CollarGeofenceAssignment {
    collar_id: string;
    geofence_id: string;
}

export const collarGeofenceAssignmentModel = {
    async create(assignment: CollarGeofenceAssignment) {
        const result = await collarGeofenceAssignmentColl.insertOne(assignment);
        return result.insertedId;
    },

    async findGeofenceIdByCollarId(collar_id: string) {
        const geofenceAssignment = await collarGeofenceAssignmentColl.findOne({ collar_id });
        if (!geofenceAssignment) {
            return null;
        }
        return geofenceAssignment.geofence_id;
    },

    async findByCollarId(collar_id: string): Promise<CollarGeofenceAssignment | null> {
        return collarGeofenceAssignmentColl.findOne({ collar_id }) as Promise<CollarGeofenceAssignment | null>;
    },

    async findAll() {
        const result = await collarGeofenceAssignmentColl.find().toArray();
        return result;
    },

    async update(collar_id: string, updates: Partial<CollarGeofenceAssignment>) {
        const result = await collarGeofenceAssignmentColl.findOneAndUpdate(
            { collar_id },
            { $set: updates },
            { returnDocument: 'after' }
        );
        return result;
    }
}