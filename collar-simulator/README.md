This application simulates animal collars. `sample-data.json` lays out the data that a singular collar will transmit every minute. The application uses a state-based design to determine the behaviour of each collar. The application should transmit a set of data every 5 minutes for every collar, although the 5 minutes is randomly staggered per collar to be more realistic.

The simulator uses TypeScript with native ES module imports and exports.

## Commands

```bash
npm install
npm run build
npm start
npm run simulate-gps
```

Set `SIMULATOR_COLLAR_COUNT` to control how many temporary collars an instance creates. Each instance assigns its collars to randomly selected existing animals and deletes them when the `stop` terminal command is entered.