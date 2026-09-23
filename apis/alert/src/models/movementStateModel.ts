export interface CollarMovementState {
    collar_id: string;
    last_position: { lat: number; lon: number };
    last_moved_time: number; // posix time
}

const collarMovementStateModel = {
    states: new Map<string, CollarMovementState>(),
    async find(collarId: string): Promise<CollarMovementState | null> {
        return this.states.get(collarId) ?? null;
    },
    async save(state: CollarMovementState): Promise<void> {
        this.states.set(state.collar_id, state);
    }
};

export default collarMovementStateModel;