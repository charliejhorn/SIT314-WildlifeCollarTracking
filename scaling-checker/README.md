# Scaling checker

This application monitors the MQTT broker and checks that simulated sensor readings are stored in MongoDB.

## Commands

Run the long-lived monitor:

```sh
npm run monitor
```

It records MQTT broker counters, logger summaries, and PM2 process information every 10 seconds. Stop it with `Ctrl+C`.

The monitor stays subscribed to the MQTT topics continuously. Broker counter messages update an in-memory latest value, which is written to the log only at the 10-second interval.

Run the metrics report:

```sh
npm run metrics
```

The report selects the monitor run with the most recent shared POSIX filename across the MQTT, logger, and PM2 directories. It calculates counter deltas from that run's first and last snapshots, then queries `sensor_data` and reports throughput, latency, loss, and process resource peaks in `metrics/`.

## MongoDB records

The `sensor_data` collection must contain `collar_id`, `seq`, `generated_posix_time`, and `received_posix_time`. The metrics command accepts POSIX timestamps in seconds or milliseconds, normalises them, and reports latency in seconds as `received_posix_time - generated_posix_time`.

## Configuration

The MQTT logger topic defaults to `logger`. The following optional variables are supported:

```text
MQTT_LOGGER_TOPIC=logger
MONITOR_INTERVAL_MS=10000
LOG_DIR=log
METRICS_DIR=metrics
MONGODB_URI=...
MONGODB_DATABASE=sit314-project
MONGODB_SENSOR_COLLECTION=sensor_data
```