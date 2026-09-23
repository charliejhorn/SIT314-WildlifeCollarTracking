import 'dotenv/config';
import { createInterface } from 'node:readline';
import { startSimulator } from './simulator.js';

async function main() {
    const simulator = await startSimulator();
    const terminal = createInterface({ input: process.stdin, output: process.stdout });

    terminal.on('line', async (input) => {
        const command = input.trim().toLowerCase();

        if (command === 'status') {
            console.log(`simulating ${simulator.getStatus()} collar(s)`);
            return;
        }

        if (command === 'stop') {
            terminal.close();
            await simulator.stop();
            return;
        }

        if (command.length > 0) {
            console.log('unknown command. use "status" or "stop".');
        }
    });
}

main().catch((error) => {
    console.error('simulator failed to start:', error.message);
    process.exit(1);
});
