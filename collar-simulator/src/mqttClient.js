import mqtt from 'mqtt';
import 'dotenv/config';

const brokerUrl = process.env.MQTT_BROKER_URL || 'broker.hivemq.com';
const brokerPort = Number(process.env.MQTT_PORT || 1883);
const topic = process.env.MQTT_TOPIC || 'betula/collar-simulator/data';

let client = null;
let connectPromise = null;

function getClient() {
    if (client) {
        return Promise.resolve(client);
    }

    client = mqtt.connect(`mqtts://${brokerUrl}:${brokerPort}`, {
        clientId: process.env.MQTT_CLIENT_ID || `collar-sim-${Date.now()}`,
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        reconnectPeriod: 5_000,
        clean: true,
        rejectUnauthorized: true
    });

    connectPromise = new Promise((resolve, reject) => {
        const onConnect = () => {
            client.removeListener('error', onError);
            resolve(client);
        };

        const onError = (error) => {
            client.removeListener('connect', onConnect);
            console.error("Error connecting to MQTT client.")
            reject(error);
        };

        client.once('connect', onConnect);
        client.once('error', onError);
    });

    return connectPromise;
}

export async function publishMessage(payload) {
    const mqttClient = await getClient();

    return new Promise((resolve, reject) => {
        mqttClient.publish(topic, JSON.stringify(payload), { qos: 0, retain: false }, (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}
