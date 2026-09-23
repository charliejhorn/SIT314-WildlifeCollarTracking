import { EnrichedSensorData, RuleResult } from "../types.js";
import { collarGeofenceAssignmentModel, geofenceModel } from '../models/geofenceModel.js';
import { distanceMeters, readCoordinates } from '../utils/geo.js';

// GEOFENCE RULE
// Logic per reading: check if reading.gps is within the geofence defined for the collar_id.
async function evaluate(reading: EnrichedSensorData): Promise<RuleResult> {
    const result: RuleResult = {
        type: 'geofence',
        violating: false,
        details: {}
    };
    const geofenceId = await collarGeofenceAssignmentModel.findGeofenceIdByCollarId(reading.collar_id);
    if (!geofenceId) return result;
    const geofence = await geofenceModel.findGeofenceById(String(geofenceId));
    if (!geofence) return result;
    const position = readCoordinates(reading.gps);
    const distance = distanceMeters(position, geofence.boundary.center);
    result.violating = distance > geofence.boundary.radius_m;
    result.details = { geofence_id: geofenceId, distance_m: distance, radius_m: geofence.boundary.radius_m };
    return result;
}

export default evaluate;