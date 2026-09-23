import { EnrichedSensorData, RuleResult } from '../types.js';
import runGeofenceRule from './geofenceRules.js';
import runVitalsRule from './vitalsRules.js';
import runNoMovementRule from './movementRules.js';

function runRules(reading: EnrichedSensorData): Promise<RuleResult[]> {
    const geofenceResult = runGeofenceRule(reading);
    const vitalsResult = runVitalsRule(reading);
    const noMovementResult = runNoMovementRule(reading);

    return Promise.all([geofenceResult, vitalsResult, noMovementResult]);
}

export default runRules;