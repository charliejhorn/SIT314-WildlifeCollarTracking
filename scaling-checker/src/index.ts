import 'dotenv/config';
import { runMetrics } from './metrics.js';
import { runMonitor } from './monitor.js';

async function main() {
    const command = process.argv[2] || 'monitor';

    if (command === 'monitor') {
        await runMonitor();
        return;
    }

    if (command === 'metrics') {
        await runMetrics();
        return;
    }

    throw new Error(`unknown command "${command}". use "monitor" or "metrics".`);
}

main().catch((error) => {
    console.error('scaling checker failed:', error instanceof Error ? error.message : error);
    process.exit(1);
});
