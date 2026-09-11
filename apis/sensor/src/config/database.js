import { MongoClient, ServerApiVersion } from 'mongodb'

const uri = `mongodb+srv://${process.env.MONGODB_USR}:${process.env.MONGODB_PWD}@cluster0.rqoc04r.mongodb.net/?appName=Cluster0`
console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    compressors: ["snappy"]
});

async function testConnection() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("MongoDB connection established.");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
testConnection().catch(console.dir);

const db = dbClient.db("sit314-project")
const sensorDataColl = db.coll("sensor-data")

module.exports = sensorDataColl