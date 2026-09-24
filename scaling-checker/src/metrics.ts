import 'dotenv/config';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { getSensorRecords, closeDatabase } from './config/database.js';
import type { LoggerLogEntry, MqttLogEntry, Pm2LogEntry, SensorRecord } from './types.js';

const logRoot = process.env.LOG_DIR || 'log';
const messagesTopic = '$SYS/broker/publish/messages/received';
const bytesTopic = '$SYS/broker/bytes/received';

async function readJsonLines<T>(path: string): Promise<T[]> {
    try {
        const content = await readFile(path, 'utf8');
        return content.split('\n').filter(Boolean).map((line) => JSON.parse(line) as T);
    } catch {
        return [];
    }
}

async function getLatestRunPosix(): Promise<string | undefined> {
    try {
        const directories = ['mqtt', 'logger', 'pm2'];
        const timestamps = await Promise.all(directories.map(async (directory) => {
            const files = await readdir(`${logRoot}/${directory}`);
            const prefix = directory === 'mqtt' ? 'broker' : directory === 'logger' ? 'summaries' : 'processes';
            return new Set(files
                .map((file) => file.match(new RegExp(`^${prefix}-(\\d+)\\.jsonl$`))?.[1])
                .filter((timestamp): timestamp is string => timestamp !== undefined));
        }));

        return [...timestamps[0]]
            .filter((timestamp) => timestamps.every((values) => values.has(timestamp)))
            .sort((first, second) => Number(second) - Number(first))[0];
    } catch {
        return undefined;
    }
}

async function readLogFile<T>(directory: string, fileName: string): Promise<T[]> {
    try {
        return await readJsonLines<T>(`${logRoot}/${directory}/${fileName}`);
    } catch {
        return [];
    }
}

function percentile(values: number[], percentage: number): number {
    if (values.length === 0) {
        return 0;
    }
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * percentage) - 1);
    return sorted[index];
}

function mergeSummaries(summaries: LoggerLogEntry[]): Record<string, number> {
    const expected: Record<string, number> = {};
    for (const summary of summaries) {
        for (const [collarId, count] of Object.entries(summary.readings_per_collar)) {
            expected[collarId] = (expected[collarId] || 0) + Number(count);
        }
    }
    return expected;
}

function calculateThroughput(entries: MqttLogEntry[], topic: string): number {
    const values = entries
        .filter((entry) => entry.topic === topic)
        .sort((first, second) => Date.parse(first.captured_at) - Date.parse(second.captured_at));
    if (values.length < 2) {
        return 0;
    }
    const first = values[0];
    const last = values[values.length - 1];
    const firstTime = Date.parse(first.captured_at);
    const lastTime = Date.parse(last.captured_at);
    const minutes = (lastTime - firstTime) / 60_000;
    const delta = last.value - first.value;
    return minutes > 0 && delta >= 0 ? delta / minutes : 0;
}

function calculateRuntimeSeconds(entries: MqttLogEntry[]): number {
    if (entries.length < 2) {
        return 0;
    }

    const times = entries
        .map((entry) => Date.parse(entry.captured_at))
        .filter(Number.isFinite);
    if (times.length < 2) {
        return 0;
    }

    return (Math.max(...times) - Math.min(...times)) / 1000;
}

function toMilliseconds(value: number | string): number {
    const timestamp = Number(value);
    if (!Number.isFinite(timestamp)) {
        return Number.NaN;
    }
    return timestamp < 100_000_000_000 ? timestamp * 1000 : timestamp;
}

function calculateResourceUsage(entries: Pm2LogEntry[]) {
    const samples: Record<string, { cpu: number[]; memory: number[] }> = {};
    for (const entry of entries) {
        for (const process of entry.processes || []) {
            const isSimulator = /^collar-simulator-\d+$/.test(process.name);
            const isTracked = isSimulator || ['node-red', 'alert-api', 'sensor-api', 'animal-api', 'collar-api'].includes(process.name);
            if (!isTracked) {
                continue;
            }
            samples[process.name] ||= { cpu: [], memory: [] };
            samples[process.name].cpu.push(process.cpu);
            samples[process.name].memory.push(process.memory);
        }
    }

    return Object.fromEntries(Object.entries(samples).map(([name, values]) => [name, {
        cpu: {
            min: Math.min(...values.cpu),
            max: Math.max(...values.cpu),
            average: values.cpu.reduce((total, value) => total + value, 0) / values.cpu.length
        },
        memory: {
            min: Math.min(...values.memory),
            max: Math.max(...values.memory),
            average: values.memory.reduce((total, value) => total + value, 0) / values.memory.length
        }
    }]));
}

function validateRecords(expected: Record<string, number>, records: SensorRecord[]) {
    const sequences: Record<string, number[]> = {};
    for (const record of records) {
        sequences[record.collar_id] ||= [];
        sequences[record.collar_id].push(Number(record.seq));
    }

    return Object.fromEntries(Object.entries(expected).map(([collarId, expectedCount]) => {
        const actual = sequences[collarId] || [];
        const seen = new Set(actual);
        const missing = Array.from({ length: expectedCount }, (_, seq) => seq).filter((seq) => !seen.has(seq));
        return [collarId, {
            expected: expectedCount,
            stored: actual.length,
            missing_sequences: missing,
            duplicate_count: actual.length - seen.size
        }];
    }));
}

export async function runMetrics(): Promise<void> {
    const runPosix = await getLatestRunPosix();
    if (!runPosix) {
        throw new Error('no monitor run has complete MQTT, logger, and PM2 log files');
    }

    console.log(`using monitor run ${runPosix}`);
    console.log('loading logger summaries');
    const summaries = await readLogFile<LoggerLogEntry>('logger', `summaries-${runPosix}.jsonl`);
    const expected = mergeSummaries(summaries);
    const collarIds = Object.keys(expected);

    console.log(`querying sensor data from db for ${collarIds.length} collars`);
    let records: SensorRecord[] = [];
    try {
        records = await getSensorRecords(collarIds);
    } finally {
        await closeDatabase();
    }

    console.log('calculating latency and loss');
    const storedByCollar: Record<string, number> = {};
    const latencies = records.map((record) => {
        storedByCollar[record.collar_id] = (storedByCollar[record.collar_id] || 0) + 1;
        const generatedTime = toMilliseconds(record.generated_posix_time);
        const receivedTime = toMilliseconds(record.received_posix_time);
        return (receivedTime - generatedTime) / 1000;
    }).filter(Number.isFinite);
    const published = Object.values(expected).reduce((total, count) => total + count, 0);
    const stored = records.length;

    console.log('calculating process resource usage');
    const mqttEntries = await readLogFile<MqttLogEntry>('mqtt', `broker-${runPosix}.jsonl`);
    const pm2Entries = await readLogFile<Pm2LogEntry>('pm2', `processes-${runPosix}.jsonl`);
    const report = {
        generated_at: new Date().toISOString(),
        runtime_seconds: calculateRuntimeSeconds(mqttEntries),
        total_collars: collarIds.length,
        published_readings: published,
        stored_readings: stored,
        loss_percent: published > 0 ? ((published - stored) / published) * 100 : 0,
        messages_per_minute: calculateThroughput(mqttEntries, messagesTopic),
        kilobytes_per_minute: calculateThroughput(mqttEntries, bytesTopic) / 1024,
        average_latency_seconds: latencies.length > 0 ? latencies.reduce((sum, value) => sum + value, 0) / latencies.length : 0,
        p95_latency_seconds: percentile(latencies, 0.95),
        stored_by_collar: storedByCollar,
        expected_by_collar: expected,
        validation: validateRecords(expected, records),
        resource_usage: calculateResourceUsage(pm2Entries)
    };

    await mkdir(process.env.METRICS_DIR || 'metrics', { recursive: true });
    const outputPath = `${process.env.METRICS_DIR || 'metrics'}/metrics-${runPosix}.json`;
    await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
    console.log(`metrics written to ${outputPath}`);
}
