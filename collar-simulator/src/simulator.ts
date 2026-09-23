import { createInitialCollarState } from './collarState.js';
import { chooseBehavior } from './behaviour.js';
import { updateGps } from './gps.js';
import { generateAccelerometerData } from './accelerometer.js';
import { generateVitals } from './vitals.js';
import { buildPayload } from './payload.js';
import { closeMqttClient, publishMessage } from './mqttClient.js';
import type { CollarState } from './types.js';
import { closeDatabase, connectDatabase, getCollarIds, getCollarStates, saveCollarState } from './config/database.js';

export interface SimulatorController {
    getStatus(): number;
    stop(): Promise<void>;
}

export async function startSimulator(): Promise<SimulatorController> {
    await connectDatabase();
    const collarIds = await getCollarIds();
    console.log("Found collar IDs:", collarIds);
    const storedStates = await getCollarStates(collarIds);
    const statesByCollarId = new Map(storedStates.map((state) => [state.collar_id, state]));
    const collars = collarIds.map((collarId) => statesByCollarId.get(collarId) ?? createInitialCollarState(collarId));
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
            const payload = buildPayload(collar, gps, vitals, accelerometer);

            await publishMessage(payload);
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
            await Promise.all(collars.map((collar) => saveCollarState(collar)));
            await closeMqttClient();
            await closeDatabase();
            console.log(`saved ${collars.length} collar state(s) and stopped simulation`);
        })();

        return stopPromise;
    }

    return {
        getStatus: () => collars.length,
        stop
    };
}

