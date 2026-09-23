import collarsConfig from '../config/collars.json' with { type: 'json' };
import { createCollarStates } from '../src/collarState.js';
import { chooseBehavior } from '../src/behaviour.js';
import { updateGps } from '../src/gps.js';
import { generateAccelerometerData } from '../src/accelerometer.js';
import { generateVitals } from '../src/vitals.js';
import { buildPayload } from '../src/payload.js';
import fs from "fs";
import path from "path";

export async function createTestPayload() {
    const collars = createCollarStates(collarsConfig);

    const collar = collars[0]
    const behavior = chooseBehavior(collar);
    const gps = updateGps(collar, behavior);
    const accelerometer = generateAccelerometerData(collar, behavior);
    const vitals = generateVitals(collar, behavior);
    const payload = buildPayload(collar, gps, vitals, accelerometer);
    writePayloadToJSON(payload)
    console.log("wrote payload to JSON. payload:\n", payload)
}

export function writePayloadToJSON(payload: Object, filename = "samplePayload.json"): void {
    const filePath = path.resolve(filename);
    const data = JSON.stringify(payload, null, 4)

    fs.writeFileSync(filePath, data, "utf8");
} 

createTestPayload()