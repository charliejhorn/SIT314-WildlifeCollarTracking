import type { AccelerometerData, CollarState, GpsReading, Payload, Vitals } from './types.js';

export function buildPayload(
    collar: CollarState,
    gps: GpsReading,
    vitals: Vitals,
    accelerometer: AccelerometerData,
    seq = 0
): Payload {
    return {
        posix_time: Math.floor(Date.now() / 1000),
        collar_id: collar.collar_id,
        seq,
        gps,
        vitals,
        accelerometer
    };
}
