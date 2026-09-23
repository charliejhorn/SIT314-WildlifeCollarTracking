export interface SensorData {
    posix_time: number;
    collar_id: string;
    gps: Record<string, unknown>;
    vitals: Record<string, unknown>;
    accelerometer: Record<string, unknown>;
}

export interface EnrichedSensorData extends SensorData {
    species: string;
} 

export interface RuleResult {
    type: 'geofence' | 'vitals' | 'no_movement';
    violating: boolean;
    details?: Record<string, unknown>;
}

export interface SpeciesThreshold {
    species: string;
    heart_rate: { min: number; max: number };
    body_temp: { min: number; max: number };
}