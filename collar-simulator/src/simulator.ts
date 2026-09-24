import { createInitialCollarState } from './collarState.js';
import { chooseBehavior } from './behaviour.js';
import { updateGps } from './gps.js';
import { generateAccelerometerData } from './accelerometer.js';
import { generateVitals } from './vitals.js';
import { buildPayload } from './payload.js';
import { closeMqttClient, publishMessage } from './mqttClient.js';
import type { CollarState } from './types.js';
import { closeDatabase, connectDatabase, createTestCollars, deleteTestCollars, getAnimalIds } from './config/database.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const COLLAR_COUNT = Number.parseInt(process.env.SIMULATOR_COLLAR_COUNT ?? '10', 10);
const DATA_TOPIC = process.env.MQTT_TOPIC || 'betula/collar-simulator/data';
const SUMMARY_TOPIC = process.env.MQTT_SUMMARY_TOPIC || 'betula/collar-simulator/summary';

if (!Number.isInteger(COLLAR_COUNT) || COLLAR_COUNT < 1) {
    throw new Error('SIMULATOR_COLLAR_COUNT must be a positive integer');
}

export interface SimulatorController {
    getStatus(): number;
    stop(): Promise<void>;
}

export async function startSimulator(): Promise<SimulatorController> {
    await connectDatabase();
    const animalIds = await getAnimalIds();
    const collarIds = await createTestCollars(animalIds, COLLAR_COUNT);
    const collars = collarIds.map((collarId) => createInitialCollarState(collarId));
    const timers = new Set<NodeJS.Timeout>();
    const inFlightTicks = new Set<Promise<void>>();
    let stopped = false;
    let stopPromise: Promise<void> | undefined;

    console.log(`starting ${collars.length} collar simulation(s)`);
    for(const collar of collars)
    {
        console.log(`Collar ${collar.collar_id} next send time is ${(new Date(collar.nextSendAt)).toISOString()}`)
    }

    for (const collar of collars) {
        scheduleNextSend(collar);
    }

    function scheduleNextSend(collar: CollarState): void {
        if (stopped) {
            return;
        }

        const delay = Math.max(0, collar.nextSendAt - Date.now());
        const timer = setTimeout(() => {
            timers.delete(timer);
            const tick = sendNextPayload(collar);
            inFlightTicks.add(tick);
            void tick.finally(() => inFlightTicks.delete(tick));
        }, delay);
        timers.add(timer);
    }

    async function sendNextPayload(collar: CollarState): Promise<void> {
        try {
            const behavior = chooseBehavior(collar);
            const gps = updateGps(collar, behavior);
            const accelerometer = generateAccelerometerData(collar, behavior);
            const vitals = generateVitals(collar, behavior);
            const payload = buildPayload(collar, gps, vitals, accelerometer, collar.readingsPublished);

            await publishMessage(payload, DATA_TOPIC);
            collar.readingsPublished += 1;
            console.log(`published collar ${collar.collar_id} to MQTT`);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`failed to publish collar ${collar.collar_id}:`, message);
        }

        collar.nextSendAt = Date.now() + 60_000; // 1 min
        scheduleNextSend(collar);
    }

    async function stop(): Promise<void> {
        if (stopPromise) {
            return stopPromise;
        }

        stopPromise = (async () => {
            stopped = true;
            for (const timer of timers) {
                clearTimeout(timer);
            }
            timers.clear();
            await Promise.all(inFlightTicks);

            const summary = {
                readings_per_collar: Object.fromEntries(
                    collars.map((collar) => [collar.collar_id, collar.readingsPublished])
                ),
                total_readings: collars.reduce((total, collar) => total + collar.readingsPublished, 0)
            };
            const logDirectory = join(process.cwd(), 'log');
            const summaryJson = JSON.stringify(summary, null, 2);
            const summaryPath = join(
                logDirectory,
                `readings-${Math.floor(Date.now() / 1000)}-${collars.length}.json`
            );

            await mkdir(logDirectory, { recursive: true });
            await writeFile(summaryPath, `${summaryJson}\n`, 'utf8');
            await publishMessage(summaryJson, SUMMARY_TOPIC);
            await deleteTestCollars(collarIds);
            await closeMqttClient();
            await closeDatabase();
            console.log(`wrote ${summaryPath}, published shutdown summary, and deleted ${collars.length} test collar(s)`);
        })();

        return stopPromise;
    }

    return {
        getStatus: () => collars.length,
        stop
    };
}

