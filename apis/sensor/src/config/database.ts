import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = `mongodb+srv://${process.env.MONGODB_USR}:${process.env.MONGODB_PWD}@cluster0.rqoc04r.mongodb.net/?appName=Cluster0`
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    compressors: ['snappy']
});

async function testConnection(): Promise<void> {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("MongoDB connection established.");
    } catch (error) {
        console.error('MongoDB connection failed:', error);
    }
}
void testConnection();

const db = client.db('sit314-project');
export const sensorDataColl = db.collection('sensor_data');