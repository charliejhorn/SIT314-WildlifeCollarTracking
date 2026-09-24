import 'dotenv/config';
import { createInterface } from 'node:readline';
import { startSimulator } from './simulator.js';

process.on('SIGINT', () => {
    console.log('\n\n🛑 Ctrl+C disabled! Type "stop" in the terminal to shut down.\n');
});

async function main() {
    const simulator = await startSimulator();
    const terminal = createInterface({ input: process.stdin, output: process.stdout });
    terminal.setPrompt('simulator> ');
    terminal.prompt();

    terminal.on('line', (input) => {
        const command = input.trim().toLowerCase();

        if (command === 'status') {
            console.log(`simulating ${simulator.getStatus()} collar(s)`);
            terminal.prompt();
            return;
        }

        if (command === 'stop') {
            terminal.close();
            void simulator.stop().catch((error) => {
                console.error('simulator failed to stop:', error instanceof Error ? error.message : String(error));
                process.exitCode = 1;
            });
            return;
        }

        if (command.length > 0) {
            console.log('unknown command. use "status" or "stop".');
        }
        terminal.prompt();
    });
}

main().catch((error) => {
    console.error('simulator failed to start:', error.message);
    process.exit(1);
});
