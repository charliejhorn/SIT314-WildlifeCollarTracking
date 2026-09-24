import 'dotenv/config';
import { startSimulator } from './simulator.js';

async function main() {
    const simulator = await startSimulator();
    let cleanupPromise: Promise<void> | undefined;

    const cleanupAndExit = (signal: string): void => {
        cleanupPromise ??= simulator.stop()
            .then(() => {
                console.log(`received ${signal}; simulator stopped`);
                process.exit(0);
            })
            .catch((error) => {
                console.error('simulator failed to stop:', error instanceof Error ? error.message : String(error));
                process.exit(1);
            });
    };

    process.on('SIGINT', () => cleanupAndExit('SIGINT'));
    process.on('SIGTERM', () => cleanupAndExit('SIGTERM'));
}

main().catch((error) => {
    console.error('simulator failed to start:', error.message);
    process.exit(1);
});
