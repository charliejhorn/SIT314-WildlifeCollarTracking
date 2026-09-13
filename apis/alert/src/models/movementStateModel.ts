export interface CollarMovementState {
    collar_id: number;
    last_position: { lat: number; lon: number };
    last_moved_time: number; // posix time
}

const collarMovementStateModel = {
    
}

export default collarMovementStateModel;