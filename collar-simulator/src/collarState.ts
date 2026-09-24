import { randomInt } from './utils.js';
import type { CollarConfig, CollarState } from './types.js';

const HOME_LATITUDE_RANGE = { min: -37.22, max: -37.18 };
const HOME_LONGITUDE_RANGE = { min: 146.76, max: 146.80 };

export function createCollarStates(collarsConfig: CollarConfig[]): CollarState[] {
    return collarsConfig.map((item) => ({
        ...createInitialCollarState(item.collar_id, item.home)
    }));
}

export function createInitialCollarState(collarId: string, home = createRandomHome()): CollarState {
    return {
        collar_id: collarId,
        readingsPublished: 0,
        home: { ...home },
        pos: { ...home },
        heading: Math.random() * (Math.PI * 2),
        activity: 'resting',
        motionLevel: 0.15,
        speed: 0.2,
        heartRateBase: 55.0,
        bodyTempBase: 38.4,
        nextSendAt: Date.now() + randomInt(5_000, 30_000)
    };
}

function createRandomHome(): { lat: number; lon: number } {
    return {
        lat: Math.random() * (HOME_LATITUDE_RANGE.max - HOME_LATITUDE_RANGE.min) + HOME_LATITUDE_RANGE.min,
        lon: Math.random() * (HOME_LONGITUDE_RANGE.max - HOME_LONGITUDE_RANGE.min) + HOME_LONGITUDE_RANGE.min
    };
}
