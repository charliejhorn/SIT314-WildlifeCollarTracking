export function buildPayload(collar, gps, vitals, accelerometer) {
    return {
        posix_time: Math.floor(Date.now() / 1000),
        collar_id: collar.collar_id,
        gps,
        vitals,
        accelerometer
    };
}
