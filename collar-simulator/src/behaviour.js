import { clamp, randomFloat, randomInt } from './utils.js';

export function chooseBehavior(collar) {
    const activityMap = {
        resting: { next: ['resting', 'walking'], level: 0.15 },
        walking: { next: ['resting', 'walking', 'running'], level: 0.75 },
        running: { next: ['walking', 'running'], level: 1.25 }
    };

    const current = collar.activity || 'resting';
    const options = activityMap[current].next;
    let nextActivity = current;

    if (Math.random() < 0.3) {
        nextActivity = options[randomInt(0, options.length - 1)];
    }

    const motionLevel = clamp(
        activityMap[nextActivity].level + randomFloat(-0.2, 0.2),
        0.05,
        1.5
    );

    collar.activity = nextActivity;
    collar.motionLevel = motionLevel;
    collar.speed = {
        resting: 0.2,
        walking: 2.5,
        running: 5.5
    }[nextActivity] + randomFloat(-0.3, 0.5);

    return { activity: nextActivity, motionLevel };
}
