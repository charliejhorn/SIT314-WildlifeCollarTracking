import { clamp, randomFloat } from './utils.js';

export function generateVitals(collar, behavior) {
    const activityBoost = {
        resting: 0,
        walking: 8,
        running: 22
    };

    const bodyTempAvg = collar.bodyTempBase + activityBoost[behavior.activity] / 10 + randomFloat(-0.2, 0.3);
    const heartRateAvg = collar.heartRateBase + activityBoost[behavior.activity] + randomFloat(-6, 9);

    const bodyTemp = {
        min: Number((bodyTempAvg - 0.25).toFixed(2)),
        max: Number((bodyTempAvg + 0.45).toFixed(2)),
        avg: Number(bodyTempAvg.toFixed(2))
    };

    const heartRate = {
        min: Math.max(35, Math.round(heartRateAvg - 8)),
        max: Math.round(heartRateAvg + 18),
        avg: Math.round(heartRateAvg)
    };

    return {
        body_temp: {
            min: clamp(bodyTemp.min, 35, 42),
            max: clamp(bodyTemp.max, 35, 42),
            avg: clamp(bodyTemp.avg, 35, 42)
        },
        heart_rate: {
            min: heartRate.min,
            max: heartRate.max,
            avg: heartRate.avg
        }
    };
}
