import 'dotenv/config';
import { MongoClient, ObjectId, ServerApiVersion, type ObjectId as MongoObjectId } from 'mongodb';
import type { SensorRecord } from '../types.js';

const uri = process.env.MONGODB_URI || `mongodb+srv://${process.env.MONGODB_USR}:${process.env.MONGODB_PWD}@cluster0.rqoc04r.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    compressors: ['snappy']
});

const db = client.db(process.env.MONGODB_DATABASE || 'sit314-project');
const animalColl = db.collection('animals');
const collarsColl = db.collection('collars');
const sensorDataColl = db.collection<SensorRecord>(process.env.MONGODB_SENSOR_COLLECTION || 'sensor_data');

let connection: Promise<void> | undefined;

export function connectDatabase(): Promise<void> {
    connection ??= client.connect().then(async () => {
        await db.command({ ping: 1 });
        console.log('MongoDB connection established.');
    });
    return connection;
}

export async function getAnimalIds(): Promise<MongoObjectId[]> {
    const animals = await animalColl.find({}, { projection: { _id: 1 } }).toArray();
    return animals.map((animal) => animal._id);
}

export async function getSensorRecords(collarIds: string[]): Promise<SensorRecord[]> {
    if (collarIds.length === 0) {
        return [];
    }

    await connectDatabase();
    return sensorDataColl.find(
        { collar_id: { $in: collarIds } },
        {
            projection: {
                _id: 0,
                collar_id: 1,
                seq: 1,
                generated_posix_time: 1,
                received_posix_time: 1
            }
        }
    ).toArray();
}

export async function createTestCollars(animalIds: MongoObjectId[], count: number): Promise<string[]> {
    if (animalIds.length === 0) {
        throw new Error('cannot create test collars because no animals exist');
    }

    const collars = Array.from({ length: count }, () => ({
        animal_id: animalIds[Math.floor(Math.random() * animalIds.length)]
    }));
    const result = await collarsColl.insertMany(collars);
    return Object.values(result.insertedIds).map((collarId) => collarId.toString());
}

export async function deleteTestCollars(collarIds: string[]): Promise<void> {
    await collarsColl.deleteMany({
        _id: { $in: collarIds.map((collarId) => new ObjectId(collarId)) }
    });
}

export async function closeDatabase(): Promise<void> {
    await client.close();
    connection = undefined;
}