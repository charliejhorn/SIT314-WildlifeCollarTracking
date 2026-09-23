import { MongoClient, ServerApiVersion } from 'mongodb';
import type { CollarState } from '../types.js';

const uri = `mongodb+srv://${process.env.MONGODB_USR}:${process.env.MONGODB_PWD}@cluster0.rqoc04r.mongodb.net/?appName=Cluster0`
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    compressors: ['snappy']
});

const db = client.db('sit314-project');
export const sensorDataColl = db.collection('dev_collar_states');
export const collarsColl = db.collection('collars');

let connection: Promise<void> | undefined;

export function connectDatabase(): Promise<void> {
    connection ??= client.connect().then(async () => {
        await db.command({ ping: 1 });
        console.log('MongoDB connection established.');
    });
    return connection;
}

export async function getCollarIds(): Promise<string[]> {
    const collars = await collarsColl.find({}, { projection: { _id: 1 } }).toArray();
    return collars
        .map((collar) => collar._id as unknown as string);
}

export async function getCollarStates(collarIds: string[]): Promise<CollarState[]> {
    const states = await sensorDataColl.find({ collar_id: { $in: collarIds } }).toArray();
    return states.filter(isCollarState) as unknown as CollarState[];
}

export async function saveCollarState(state: CollarState): Promise<void> {
    await sensorDataColl.replaceOne(
        { collar_id: state.collar_id },
        state,
        { upsert: true }
    );
}

function isCollarState(value: unknown): value is CollarState {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const state = value as Partial<CollarState>;
    return typeof state.collar_id === 'string'
        && typeof state.home?.lat === 'number'
        && typeof state.home?.lon === 'number'
        && typeof state.pos?.lat === 'number'
        && typeof state.pos?.lon === 'number'
        && typeof state.heading === 'number'
        && typeof state.activity === 'string'
        && typeof state.motionLevel === 'number'
        && typeof state.speed === 'number'
        && typeof state.heartRateBase === 'number'
        && typeof state.bodyTempBase === 'number'
        && typeof state.nextSendAt === 'number';
}