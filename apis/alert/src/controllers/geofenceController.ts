import type { NextFunction, Request, Response } from 'express';
import {
	collarGeofenceAssignmentModel,
	geofenceModel,
	Geofence
} from '../models/geofenceModel.js';

function isValidBoundary(boundary: unknown): boundary is Geofence['boundary'] {
	if (!boundary || typeof boundary !== 'object') return false;
	const candidate = boundary as Geofence['boundary'];
	return Number.isFinite(candidate.center?.lat)
		&& Number.isFinite(candidate.center?.lon)
		&& Number.isFinite(candidate.radius_m)
		&& candidate.radius_m > 0;
}

function getId(req: Request<{ geofenceId: string }>): string | null {
	const { geofenceId } = req.params;
	return typeof geofenceId === 'string' && geofenceId.length > 0 ? geofenceId : null;
}

function getCollarId(req: Request<{ collar_id: string }>): string | null {
	const { collar_id } = req.params;
	return typeof collar_id === 'string' && /^\d+$/.test(collar_id) ? collar_id : null;
}

const geofenceController = {
	async createGeofence(req: Request, res: Response, next: NextFunction) {
		try {
			const { name, boundary } = req.body as Partial<Geofence>;
			if (typeof name !== 'string' || name.trim() === '' || !isValidBoundary(boundary)) {
				return res.status(400).json({ error: 'name and a valid boundary are required' });
			}

			const geofence: Geofence = { name: name.trim(), boundary };
			const id = await geofenceModel.create(geofence);
			return res.status(201).json({ _id: id, ...geofence });
		} catch (error) {
			next(error);
		}
	},

	async listGeofences(_req: Request, res: Response, next: NextFunction) {
		try {
			return res.status(200).json(await geofenceModel.findAll());
		} catch (error) {
			next(error);
		}
	},

	async getGeofenceById(req: Request<{ geofenceId: string }>, res: Response, next: NextFunction) {
		try {
			const id = getId(req);
			if (!id) return res.status(400).json({ error: 'geofenceId is required' });
			const geofence = await geofenceModel.findGeofenceById(id);
			if (!geofence) return res.status(404).json({ error: 'geofence not found' });
			return res.status(200).json(geofence);
		} catch (error) {
			next(error);
		}
	},

	async updateGeofence(req: Request<{ geofenceId: string }>, res: Response, next: NextFunction) {
		try {
			const id = getId(req);
			if (!id) return res.status(400).json({ error: 'geofenceId is required' });
			const { name, boundary } = req.body as Partial<Geofence>;
			const updates: Partial<Geofence> = {};
			if (name !== undefined) {
				if (typeof name !== 'string' || name.trim() === '') {
					return res.status(400).json({ error: 'name must be a non-empty string' });
				}
				updates.name = name.trim();
			}
			if (boundary !== undefined) {
				if (!isValidBoundary(boundary)) {
					return res.status(400).json({ error: 'boundary is invalid' });
				}
				updates.boundary = boundary;
			}
			if (Object.keys(updates).length === 0) {
				return res.status(400).json({ error: 'at least one update is required' });
			}

			const existing = await geofenceModel.findGeofenceById(id);
			if (!existing) return res.status(404).json({ error: 'geofence not found' });
			return res.status(200).json(await geofenceModel.update(id, updates));
		} catch (error) {
			next(error);
		}
	},

	async deleteGeofence(req: Request<{ geofenceId: string }>, res: Response, next: NextFunction) {
		try {
			const id = getId(req);
			if (!id) return res.status(400).json({ error: 'geofenceId is required' });
			const existing = await geofenceModel.findGeofenceById(id);
			if (!existing) return res.status(404).json({ error: 'geofence not found' });
			await geofenceModel.delete(id);
			return res.status(204).send();
		} catch (error) {
			next(error);
		}
	},

	async assignCollarToGeofence(req: Request<{ collar_id: string }>, res: Response, next: NextFunction) {
		try {
			const collarId = getCollarId(req);
			const { geofence_id } = req.body as { geofence_id?: unknown };
			if (!collarId || typeof geofence_id !== 'string' || !geofence_id) {
				return res.status(400).json({ error: 'collar_id and geofence_id are required' });
			}
			if (!await geofenceModel.findGeofenceById(geofence_id)) {
				return res.status(404).json({ error: 'geofence not found' });
			}

			const assignment = await collarGeofenceAssignmentModel.findByCollarId(collarId);
			const saved = assignment
				? await collarGeofenceAssignmentModel.update(collarId, { geofence_id })
				: await collarGeofenceAssignmentModel.create({ collar_id: collarId, geofence_id });
			return res.status(assignment ? 200 : 201).json(saved);
		} catch (error) {
			next(error);
		}
	},

	async getGeofenceForCollar(req: Request<{ collar_id: string }>, res: Response, next: NextFunction) {
		try {
			const collarId = getCollarId(req);
			if (!collarId) return res.status(400).json({ error: 'collar_id must be a positive integer' });
			const assignment = await collarGeofenceAssignmentModel.findByCollarId(collarId);
			if (!assignment) return res.status(404).json({ error: 'no geofence assigned to collar' });
			const geofence = await geofenceModel.findGeofenceById(assignment.geofence_id);
			if (!geofence) return res.status(404).json({ error: 'geofence not found' });
			return res.status(200).json({ ...geofence, collar_id: collarId });
		} catch (error) {
			next(error);
		}
	}
};

export default geofenceController;