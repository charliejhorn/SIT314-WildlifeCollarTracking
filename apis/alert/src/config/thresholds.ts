import { SpeciesThreshold } from "../types.js";

export type SPECIES_VITAL_THRESHOLDS = Record<string, SpeciesThreshold>
export type SPECIES_NO_MOVEMENT_THRESHOLD_HOURS = Record<string, number>
export type ALERT_REPEAT_INTERVAL_HOURS = number // currently 1, same for all types
export type NO_MOVEMENT_RADIUS_M = number // the 5m constant

export const speciesVitalThresholds: SPECIES_VITAL_THRESHOLDS = {
	lion: { species: 'lion', heart_rate: { min: 40, max: 80 }, body_temp: { min: 37.5, max: 39.5 } },
	giraffe: { species: 'giraffe', heart_rate: { min: 40, max: 90 }, body_temp: { min: 38.0, max: 39.5 } },
	hippo: { species: 'hippo', heart_rate: { min: 30, max: 50 }, body_temp: { min: 36.0, max: 37.5 } },
	zebra: { species: 'zebra', heart_rate: { min: 40, max: 80 }, body_temp: { min: 37.2, max: 38.9 } },
	elephant: { species: 'elephant', heart_rate: { min: 25, max: 40 }, body_temp: { min: 35.5, max: 37.5 } }
};

export const speciesNoMovementThresholdHours: SPECIES_NO_MOVEMENT_THRESHOLD_HOURS = {
	lion: 1, giraffe: 1, hippo: 1, zebra: 1, elephant: 1
};

export const noMovementRadiusM: NO_MOVEMENT_RADIUS_M = 5;