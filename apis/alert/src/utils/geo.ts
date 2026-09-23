export interface Coordinates { lat: number; lon: number }

export function distanceMeters(a: Coordinates, b: Coordinates): number {
	const earthRadiusMeters = 6371000;
	const latDelta = (b.lat - a.lat) * Math.PI / 180;
	const lonDelta = (b.lon - a.lon) * Math.PI / 180;
	const latA = a.lat * Math.PI / 180;
	const latB = b.lat * Math.PI / 180;
	const haversine = Math.sin(latDelta / 2) ** 2
		+ Math.cos(latA) * Math.cos(latB) * Math.sin(lonDelta / 2) ** 2;
	return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function readCoordinates(gps: Record<string, unknown>): Coordinates {
	const lat = Number(gps.lat);
	const lon = Number(gps.lon);
	if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('GPS coordinates must contain finite lat and lon values');
	return { lat, lon };
}