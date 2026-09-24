import 'dotenv/config';
import { mkdir, appendFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { subscribeToTopics, closeMqttClient } from './mqttClient.js';
import type { LoggerSummary, MqttLogEntry, Pm2LogEntry, Pm2ProcessSnapshot } from './types.js';

const execFileAsync = promisify(execFile);
const intervalMs = Number(process.env.MONITOR_INTERVAL_MS || 10_000);
const loggerTopic = process.env.MQTT_LOGGER_TOPIC || 'logger';
const messagesTopic = '$SYS/broker/publish/messages/received';
const bytesTopic = '$SYS/broker/bytes/received';

async function writeJsonLine(path: string, value: unknown): Promise<void> {
    await appendFile(path, `${JSON.stringify(value)}\n`, 'utf8');
}

async function readPm2(): Promise<Pm2LogEntry> {
    const capturedAt = new Date().toISOString();

    try {
        const result = await execFileAsync('pm2', ['jlist']);
        const processes = JSON.parse(result.stdout) as Array<Record<string, unknown>>;
        const snapshots: Pm2ProcessSnapshot[] = processes.map((processInfo) => {
            const monit = (processInfo.monit || {}) as Record<string, unknown>;
            return {
                name: String(processInfo.name || 'unknown'),
                pm_id: typeof processInfo.pm_id === 'number' ? processInfo.pm_id : undefined,
                status: typeof processInfo.pm2_env === 'object' && processInfo.pm2_env !== null
                    ? String((processInfo.pm2_env as Record<string, unknown>).status || '')
                    : undefined,
                cpu: Number(monit.cpu || 0),
                memory: Number(monit.memory || 0)
            };
        });
        return { captured_at: capturedAt, processes: snapshots };
    } catch (error) {
        return {
            captured_at: capturedAt,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

export async function runMonitor(): Promise<void> {
    const logRoot = process.env.LOG_DIR || 'log';
    const runPosix = Date.now();
    const mqttLogPath = `${logRoot}/mqtt/broker-${runPosix}.jsonl`;
    const loggerLogPath = `${logRoot}/logger/summaries-${runPosix}.jsonl`;
    const pm2LogPath = `${logRoot}/pm2/processes-${runPosix}.jsonl`;
    await Promise.all([
        mkdir(`${logRoot}/mqtt`, { recursive: true }),
        mkdir(`${logRoot}/logger`, { recursive: true }),
        mkdir(`${logRoot}/pm2`, { recursive: true })
    ]);

    const latestValues = new Map<string, number>();
    const onMessage = async (topic: string, message: Buffer): Promise<void> => {
        const capturedAt = new Date().toISOString();

        if (topic === messagesTopic || topic === bytesTopic) {
            const value = Number(message.toString());
            if (Number.isFinite(value)) {
                latestValues.set(topic, value);
            }
            return;
        }

        if (topic === loggerTopic) {
            try {
                const summary = JSON.parse(message.toString()) as LoggerSummary;
                if (!summary.readings_per_collar || typeof summary.total_readings !== 'number') {
                    throw new Error('logger message has an invalid shape');
                }
                await writeJsonLine(loggerLogPath, {
                    ...summary,
                    captured_at: capturedAt,
                    topic
                });
            } catch (error) {
                console.error('could not parse logger message:', error instanceof Error ? error.message : error);
            }
        }
    };

    await subscribeToTopics([messagesTopic, bytesTopic, loggerTopic], onMessage);

    let stopping = false;
    const sample = async (): Promise<void> => {
        for (const [topic, value] of latestValues) {
            const entry: MqttLogEntry = {
                captured_at: new Date().toISOString(),
                topic,
                value
            };
            await writeJsonLine(mqttLogPath, entry);
        }
        const entry = await readPm2();
        await writeJsonLine(pm2LogPath, entry);
    };

    await sample();
    const timer = setInterval(() => {
        void sample().catch((error) => console.error('could not write PM2 sample:', error));
    }, intervalMs);

    const stop = async (): Promise<void> => {
        if (stopping) {
            return;
        }
        stopping = true;
        clearInterval(timer);
        await closeMqttClient();
        console.log('monitor stopped');
    };

    process.once('SIGINT', () => { void stop(); });
    process.once('SIGTERM', () => { void stop(); });
    console.log(`monitoring MQTT and PM2 every ${intervalMs / 1000} seconds; MQTT counters are cached and logged only at each interval`);
}
