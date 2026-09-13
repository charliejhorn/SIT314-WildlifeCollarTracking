export interface Zone {
    id?: number;
    name: string;
    boundary: { center: { lat: number; lon: number }; radius_m: number };
}

export const zoneModel = {

}

export interface CollarZoneAssignment {
    collar_id: number;
    zone_id: number;
}

export const collarZoneAssignmentModel = {

}