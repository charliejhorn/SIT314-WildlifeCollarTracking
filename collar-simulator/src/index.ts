import 'dotenv/config';
import { startSimulator } from './simulator.js';

async function main() {
    await startSimulator();
}

main().catch((error) => {
    console.error('simulator failed to start:', error.message);
    process.exit(1);
});
