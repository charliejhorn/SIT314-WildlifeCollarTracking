// 1. Violating, no unresolved Alert exists for (collar_id, type) → insert a new Alert (triggered_at = last_notified_at = now), notify Node-RED.
// 2. Violating, unresolved Alert exists → if now - last_notified_at >= 1hr, update last_notified_at = now on the same document and notify Node-RED; otherwise do nothing — no DB write, no notification.
// 3. Not violating, unresolved Alert exists → set resolved_at = now on it, notify Node-RED that it resolved.
// 4. Not violating, no unresolved Alert exists → nothing to do.

processRuleResults(results: RuleResult[], collar_id: number, animal_id?: number): Promise<void>
findActiveAlert(collar_id: number, type: string): Promise<Alert | null>