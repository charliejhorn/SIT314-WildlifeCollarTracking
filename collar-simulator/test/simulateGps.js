import collarsConfig from '../config/collars.json' with { type: 'json' };
import { createCollarStates } from '../src/collarState.js';
import { chooseBehavior } from '../src/behaviour.js';
import { updateGps } from '../src/gps.js'
import fs from "fs";
import path from "path";

const collars = createCollarStates(collarsConfig)
let positions = []

for(let i = 0; i < 10000; i++)
{
    for (const collar of collars)
    {
        const behavior = chooseBehavior(collar);
        const gps = updateGps(collar, behavior);
        console.log(gps.lat, gps.lon);
        positions.push([gps.lat, gps.lon]);
    }
}

export function writePositionsToCSV(positions, filename = "locations.csv") {
  const filePath = path.resolve(filename);
  const rows = positions.map(([lat, lon]) => `${lat},${lon}`);
  const csv = `Latitude,Longitude\n${rows.join("\n")}\n`;

  fs.writeFileSync(filePath, csv, "utf8");
}

writePositionsToCSV(positions)