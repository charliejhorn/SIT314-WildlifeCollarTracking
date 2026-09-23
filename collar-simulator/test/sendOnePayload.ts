import { closeMqttClient, publishMessage } from '../src/mqttClient.js';
import samplePayload from '../samplePayload.json' with { type: 'json' };
import type { Payload } from '../src/types.js';

console.log('Sending sample payload to MQTT broker...');

try {
  await publishMessage(samplePayload as unknown as Payload);
  console.log('Sample payload sent successfully!');
} finally {
  await closeMqttClient();
}