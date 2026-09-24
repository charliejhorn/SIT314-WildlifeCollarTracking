import { MongoClient, ObjectId, ServerApiVersion, type ObjectId as MongoObjectId } from 'mongodb';

const uri = `mongodb+srv://${process.env.MONGODB_USR}:${process.env.MONGODB_PWD}@cluster0.rqoc04r.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    compressors: ['snappy']
});

const db = client.db('sit314-project');
const animalColl = db.collection('animals');
const collarsColl = db.collection('collars');

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