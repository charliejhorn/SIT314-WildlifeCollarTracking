import { EnrichedSensorData, RuleResult } from "../types.js";
import collarMovementStateModel from '../models/movementStateModel.js';
import { getNoMovementThreshold } from '../services/thresholdService.js';
import { noMovementRadiusM } from '../config/thresholds.js';
import { distanceMeters, readCoordinates } from '../utils/geo.js';

// Logic per reading: compute distance between reading.gps and last_position (haversine). 
// If it's over 5m, set last_position to the new coords and last_moved_time to the reading's timestamp. 
// Otherwise leave last_moved_time untouched. The rule then just checks now - last_moved_time > threshold_hours.


async function evaluate(reading: EnrichedSensorData): Promise<RuleResult> {
    try {
        const result: RuleResult = {
            type: 'no_movement',
            violating: false,
            details: {}
        };
        const position = readCoordinates(reading.gps);
        const readingTime = Number(reading.generated_posix_ms);
        const existingState = await collarMovementStateModel.find(reading.collar_id);
        let state = existingState;
        if (!state) {
            state = { collar_id: reading.collar_id, last_position: position, last_moved_time: readingTime };
        } else if (distanceMeters(state.last_position, position) > noMovementRadiusM) {
            state = { collar_id: reading.collar_id, last_position: position, last_moved_time: readingTime };
        }
        await collarMovementStateModel.save(state);
        const thresholdHours = getNoMovementThreshold(reading.species);
        if (thresholdHours === undefined) return result;
        const hoursSinceMovement = (Date.now() - state.last_moved_time) / (1000 * 60 * 60);
        result.violating = hoursSinceMovement > thresholdHours;
        result.details = { hours_since_movement: hoursSinceMovement, threshold_hours: thresholdHours };
        return result;
    } catch (error) {
        console.error('Error evaluating movement rule:', error);
        throw error;
    }

}

export default evaluate;