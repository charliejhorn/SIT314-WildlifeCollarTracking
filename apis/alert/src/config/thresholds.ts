import { SpeciesThreshold } from "../types.js"

export type SPECIES_VITAL_THRESHOLDS = Record<string, SpeciesThreshold>
export type SPECIES_NO_MOVEMENT_THRESHOLD_HOURS = Record<string, number>
export type ALERT_REPEAT_INTERVAL_HOURS = number // currently 1, same for all types
export type NO_MOVEMENT_RADIUS_M = number // the 5m constant