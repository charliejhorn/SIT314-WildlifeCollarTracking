export type Activity = 'resting' | 'walking' | 'running';

export interface Position {
    lat: number;
    lon: number;
}

export interface CollarConfig {
    collar_id: string;
    home: Position & { rangeRadius?: number };
}

export interface CollarState {
    collar_id: string;
    readingsPublished: number;
    home: Position & { rangeRadius?: number };
    pos: Position;
    heading: number;
    activity: Activity;
    motionLevel: number;
    speed: number;
    heartRateBase: number;
    bodyTempBase: number;
    nextSendAt: number;
    runStreak?: number;
}

export interface Behaviour {
    activity: Activity;
    motionLevel: number;
}

export interface GpsReading extends Position {
    hdop: number;
    satellites: number;
    fixQuality: number;
}

export interface NumericSummary {
    min: number;
    max: number;
    avg: number;
}

export interface AccelerometerSample {
    x: number;
    y: number;
    z: number;
}

export interface AccelerometerData {
    x: NumericSummary;
    y: NumericSummary;
    z: NumericSummary;
    samples: AccelerometerSample[];
}

export interface Vitals {
    body_temp: NumericSummary;
    heart_rate: NumericSummary;
}

export interface Payload {
    posix_time: number;
    collar_id: string;
    seq: number;
    gps: GpsReading;
    vitals: Vitals;
    accelerometer: AccelerometerData;
}

export interface LoggerSummary {
    readings_per_collar: Record<string, number>;
    total_readings: number;
}

export interface LoggerLogEntry extends LoggerSummary {
    captured_at: string;
    topic: string;
}

export interface MqttLogEntry {
    captured_at: string;
    topic: string;
    value: number;
}

export interface Pm2ProcessSnapshot {
    name: string;
    pm_id?: number;
    status?: string;
    cpu: number;
    memory: number;
}

export interface Pm2LogEntry {
    captured_at: string;
    processes?: Pm2ProcessSnapshot[];
    error?: string;
}

export interface SensorRecord {
    collar_id: string;
    seq: number;
    generated_posix_time: number | string;
    received_posix_time: number | string;
}