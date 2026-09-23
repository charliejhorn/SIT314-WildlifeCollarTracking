import { EnrichedSensorData, RuleResult } from '../types.js';
import alertModel, { Alert, AlertQuery } from '../models/alertModel.js';

// 1. Violating, no unresolved Alert exists for (collar_id, type) → insert a new Alert (triggered_at = last_notified_at = now), notify Node-RED.
// 2. Violating, unresolved Alert exists → if now - last_notified_at >= 1hr, update last_notified_at = now on the same document and notify Node-RED; otherwise do nothing — no DB write, no notification.
// 3. Not violating, unresolved Alert exists → set resolved_at = now on it, notify Node-RED that it resolved.
// 4. Not violating, no unresolved Alert exists → nothing to do.

function processRuleResults(results: RuleResult[], collar_id: string, species: string): Promise<void> {
    // Implementation for processing rule results
    return Promise.resolve();
}

// function findActiveAlert(collar_id: number, type: string): Promise<Alert | null> {
//     const query: AlertQuery = {
//         collar_id,
//         type,
//         resolved: false
//     };
//     return alertModel.find(query);
// }

export { processRuleResults };