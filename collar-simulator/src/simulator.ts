import collarsConfig from '../config/collars.json' with { type: 'json' };
import { createCollarStates } from './collarState.js';
import { chooseBehavior } from './behaviour.js';
import { updateGps } from './gps.js';
import { generateAccelerometerData } from './accelerometer.js';
import { generateVitals } from './vitals.js';
import { buildPayload } from './payload.js';
import { publishMessage } from './mqttClient.js';
import type { CollarState } from './types.js';

export async function startSimulator() {
    const collars = createCollarStates(collarsConfig);

    console.log(`starting ${collars.length} collar simulation(s)`);
    for(const collar of collars)
    {
        console.log(`Collar ${collar.collar_id} next send time is ${(new Date(collar.nextSendAt)).toISOString()}`)
    }

    for (const collar of collars) {
        scheduleNextSend(collar);
    }

    function scheduleNextSend(collar: CollarState): void {
        const delay = Math.max(0, collar.nextSendAt - Date.now());

        setTimeout(async () => {
        try {
            const behavior = chooseBehavior(collar);
            const gps = updateGps(collar, behavior);
            const accelerometer = generateAccelerometerData(collar, behavior);
            const vitals = generateVitals(collar, behavior);
            const payload = buildPayload(collar, gps, vitals, accelerometer);

            await publishMessage(payload);
            console.log(`published collar ${collar.collar_id} to MQTT`);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`failed to publish collar ${collar.collar_id}:`, message);
        }

        collar.nextSendAt = Date.now() + 300_000; // 5 min
        scheduleNextSend(collar);
        }, delay);
    }
}

