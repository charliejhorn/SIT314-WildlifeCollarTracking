import { sensorDataColl } from '../config/database'

const sensorDataModel = {
    async create(sensorData) {
        const result = await sensorDataColl.insertOne(sensorData);
        return result.insertedId; // MongoDB uses insertedId, not insertId
    },
}

export default sensorDataModel