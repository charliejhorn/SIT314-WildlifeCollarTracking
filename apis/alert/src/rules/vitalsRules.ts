import { EnrichedSensorData, RuleResult } from "../types.js";
import { getThresholds } from "../services/thresholdService.js";

async function evaluate(reading: EnrichedSensorData): Promise<RuleResult> {
    const thresholds = await getThresholds(reading.species);
    const result: RuleResult = {
        type: 'vitals',
        violating: false,
        details: {}
    };
    if (!thresholds) return result;
    const bodyTemp = Number((reading.vitals.body_temp as { avg: string | number }).avg);
    const heartRate = Number((reading.vitals.heart_rate as { avg: string | number }).avg);
    const bodyTempViolating = bodyTemp < thresholds.body_temp.min || bodyTemp > thresholds.body_temp.max;
    const heartRateViolating = heartRate < thresholds.heart_rate.min || heartRate > thresholds.heart_rate.max;
    result.violating = bodyTempViolating || heartRateViolating;
    result.details = {
        species: reading.species,
        body_temp: { value: bodyTemp, threshold: thresholds.body_temp, violating: bodyTempViolating },
        heart_rate: { value: heartRate, threshold: thresholds.heart_rate, violating: heartRateViolating }
    };
    return result;
}

export default evaluate;