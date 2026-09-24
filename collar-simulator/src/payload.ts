import type { AccelerometerData, CollarState, GpsReading, Payload, Vitals } from './types.js';

export function buildPayload(
    collar: CollarState,
    gps: GpsReading,
    vitals: Vitals,
    accelerometer: AccelerometerData,
    seq = 0
): Payload {
    return {
        generated_posix_ms: Date.now(),
        collar_id: collar.collar_id,
        seq,
        gps,
        vitals,
        accelerometer
    };
}
