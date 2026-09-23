import mqtt from 'mqtt';
import 'dotenv/config';
import type { MqttClient } from 'mqtt';
import type { Payload } from './types.js';

const brokerUrl = process.env.MQTT_BROKER_URL || 'broker.hivemq.com';
const brokerPort = Number(process.env.MQTT_PORT || 1883);
const topic = process.env.MQTT_TOPIC || 'betula/collar-simulator/data';

let client: MqttClient | null = null;
let connectPromise: Promise<MqttClient> | null = null;

function getClient(): Promise<MqttClient> {
    if (client) {
        return Promise.resolve(client);
    }

    const connectedClient = mqtt.connect(`mqtts://${brokerUrl}:${brokerPort}`, {
        clientId: process.env.MQTT_CLIENT_ID || `collar-sim-${Date.now()}`,
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        reconnectPeriod: 5_000,
        clean: true,
        rejectUnauthorized: true
    });
    client = connectedClient;

    connectPromise = new Promise((resolve, reject) => {
        const onConnect = () => {
            connectedClient.removeListener('error', onError);
            console.log(`Connected to MQTT broker at ${brokerUrl}:${brokerPort}`);
            resolve(connectedClient);
        };

        const onError = (error: Error) => {
            connectedClient.removeListener('connect', onConnect);
            console.error("Error connecting to MQTT client.")
            reject(error);
        };

        connectedClient.once('connect', onConnect);
        connectedClient.once('error', onError);
    });

    return connectPromise;
}

export async function publishMessage(payload: Payload | string): Promise<void> {
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

export async function closeMqttClient(): Promise<void> {
    if (!client) {
        return;
    }

    const mqttClient = client;
    client = null;
    connectPromise = null;

    await new Promise<void>((resolve, reject) => {
        mqttClient.end(false, (error?: Error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}
