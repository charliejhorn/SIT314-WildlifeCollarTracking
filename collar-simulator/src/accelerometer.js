import { clamp, randomFloat } from './utils.js';

export function generateAccelerometerData(collar, behavior) {
    const sampleCount = behavior.activity === 'running' ? 16 : behavior.activity === 'walking' ? 12 : 8;
    const amplitude = {
        resting: { x: 0.2, y: 0.2, z: 0.15 },
        walking: { x: 0.6, y: 0.8, z: 0.7 },
        running: { x: 1.2, y: 1.4, z: 1.1 }
    }[behavior.activity];

    const samples = [];
    for (let i = 0; i < sampleCount; i += 1) {
        const x = clamp(randomFloat(-amplitude.x, amplitude.x) + (behavior.activity === 'running' ? Math.sin(i / 2) * 0.2 : 0), -2, 2);
        const y = clamp(randomFloat(-amplitude.y, amplitude.y) + Math.cos(i / 3) * 0.15, -2, 2);
        const z = clamp(randomFloat(-amplitude.z, amplitude.z) + 0.5 + (behavior.activity === 'resting' ? 0.05 : 0.25), -2, 2);
        samples.push({ x: Number(x.toFixed(3)), y: Number(y.toFixed(3)), z: Number(z.toFixed(3)) });
    }

    const axes = ['x', 'y', 'z'];
    const result = {};

    for (const axis of axes) {
        const values = samples.map((sample) => sample[axis]);
        result[axis] = {
            min: Math.min(...values),
            max: Math.max(...values),
            avg: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(3))
        };
    }

    return { ...result, samples };
}
