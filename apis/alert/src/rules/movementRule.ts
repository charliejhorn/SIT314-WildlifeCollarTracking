import { RuleResult } from "./index.js";

// Logic per reading: compute distance between reading.gps and last_position (haversine). 
// If it's over 5m, set last_position to the new coords and last_moved_time to the reading's timestamp. 
// Otherwise leave last_moved_time untouched. The rule then just checks now - last_moved_time > threshold_hours.

evaluate(reading: EnrichedSensorData): Promise<RuleResult>