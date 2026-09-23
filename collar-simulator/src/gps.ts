import { randomFloat } from './utils.js';
import type { Behaviour, CollarState, GpsReading } from './types.js';

const RANGE = 15000;
const PULL_COEFFICIENT = 0.03;

export function updateGps(collar: CollarState, behavior: Behaviour): GpsReading {
    // Approx meters/minute at motionLevel = 1. Calibrated for a grazing
    // mammal (e.g. cattle/deer-scale animal), not a small rodent or a horse.
    const activityScale = {
        resting: 1,        // shifting weight, small in-place drift
        grazing: 10,        // slow, near-continuous foraging movement
        walking: 60,         // ~3.6 km/h, purposeful movement between patches
        running: 300          // ~18 km/h, short-burst flight/chase speed
    };

    const homeLat = collar.home.lat;
    const homeLon = collar.home.lon;
    // How far (meters) the animal can roam before the pull home gets strong.
    // Override per-animal via collar.home.rangeRadius if you have real
    // home-range data; this default is a reasonable mid-size-mammal guess.
    const homeRangeRadius = collar.home.rangeRadius ?? RANGE;

    const latDiff = homeLat - collar.pos.lat;
    const lonDiff = homeLon - collar.pos.lon;

    // Convert the lat/lon offset to meters properly — a degree of longitude
    // shrinks by cos(latitude), so treating both diffs as equivalent
    // "degrees" (as before) overstates east-west distance away from the
    // equator and skews both the distance and the bearing.
    const latDiffM = latDiff * 111_000;
    const lonDiffM = lonDiff * 111_000 * Math.cos((collar.pos.lat * Math.PI) / 180);
    const distanceM = Math.hypot(latDiffM, lonDiffM);

    // Stronger pull the farther outside its normal range it gets; squared
    // easing keeps the pull negligible near the center and sharp near/past
    // the boundary, rather than a straight linear ramp.
    const pullStrength = PULL_COEFFICIENT * Math.min(distanceM / homeRangeRadius, 1) ** 2;

    const bearingToHome = Math.atan2(latDiffM, lonDiffM);

    // How much the heading wanders on its own vs. course-corrects toward
    // home depends on activity: a grazing animal ambles in tight,
    // meandering arcs; a walking/running animal holds a heading longer.
    const wanderRange = {
        resting: 0.9,
        grazing: 0.6,
        walking: 0.3,
        running: 0.15
    }[behavior.activity] ?? 0.35;

    const randomWander = randomFloat(-wanderRange, wanderRange);

    collar.heading = lerpAngle(
        collar.heading + randomWander,
        bearingToHome,
        pullStrength
    );

    // "Spook" jumps (sudden large course change) are far more likely while
    // already moving/alert than while resting or calmly grazing.
    const spookChance = {
        resting: 0.01,
        grazing: 0.03,
        walking: 0.08,
        running: 0.15
    }[behavior.activity] ?? 0.05;

    if (Math.random() < spookChance) {
        collar.heading += randomFloat(-1.2, 1.2);
    }

    // Stamina: running can't sustain indefinitely. Track consecutive
    // running minutes on the collar and decay speed + raise the chance the
    // animal drops back to walking the longer a chase/flight goes on.
    if (behavior.activity === "running") {
        collar.runStreak = (collar.runStreak ?? 0) + 1;
    } else {
        collar.runStreak = 0;
    }

    let effectiveActivity = behavior.activity;
    let fatigueFactor = 1;
    if (behavior.activity === "running" && collar.runStreak > 3) {
        // After ~3 minutes of sustained running, speed tails off.
        fatigueFactor = Math.max(0.4, 1 - (collar.runStreak - 3) * 0.15);
        if (collar.runStreak > 8) {
            // Past ~8 minutes, force a drop to walking — nothing sprints
            // that long at these speeds.
            effectiveActivity = "walking";
            collar.runStreak = 0;
        }
    }

    const baseSpeed = activityScale[effectiveActivity] ?? activityScale.walking;
    const metersPerMinute = behavior.motionLevel * baseSpeed * fatigueFactor;

    const metersToDegreesLat = metersPerMinute / 111_000;
    const metersToDegreesLon = metersPerMinute / (111_000 * Math.cos((collar.pos.lat * Math.PI) / 180));

    const latDelta = Math.sin(collar.heading) * metersToDegreesLat;
    const lonDelta = Math.cos(collar.heading) * metersToDegreesLon;

    // GPS jitter even when stationary (multipath, atmospheric noise).
    const smallNoiseLat = randomFloat(-0.00004, 0.00004);
    const smallNoiseLon = randomFloat(-0.00004, 0.00004);

    const nextLat = collar.pos.lat + latDelta + smallNoiseLat;
    const nextLon = collar.pos.lon + lonDelta + smallNoiseLon;

    collar.pos = { lat: nextLat, lon: nextLon };

    return {
        lat: nextLat,
        lon: nextLon,
        hdop: Number((0.8 + randomFloat(0, 0.7)).toFixed(2)),
        satellites: Math.round(6 + Math.random() * 7),
        fixQuality: Math.random() < 0.9 ? 1 : 2
    };
}

function lerpAngle(a: number, b: number, t: number): number {
    let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
    return a + diff * t;
}



