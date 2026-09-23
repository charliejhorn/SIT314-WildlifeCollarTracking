import { speciesNoMovementThresholdHours, speciesVitalThresholds } from '../config/thresholds.js';
import { SpeciesThreshold } from '../types.js';

function getThresholds(species: string): Promise<SpeciesThreshold | undefined> {
	return Promise.resolve(speciesVitalThresholds[species.toLowerCase()]);
}

function getNoMovementThreshold(species: string): number | undefined {
	return speciesNoMovementThresholdHours[species.toLowerCase()];
}

export { getThresholds, getNoMovementThreshold };