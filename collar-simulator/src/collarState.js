import { randomInt } from './utils.js';

export function createCollarStates(collarsConfig) {
    return collarsConfig.map((item) => ({
        collar_id: item.collar_id,
        home: { ...item.home },
        pos: { ...item.home },
        heading: Math.random() * (Math.PI * 2),
        activity: 'resting',
        motionLevel: 0.15,
        speed: 0.2,
        heartRateBase: 55.0,
        bodyTempBase: 38.4, 
        nextSendAt: Date.now() + randomInt(5_000, 30_000)
    }));
}
