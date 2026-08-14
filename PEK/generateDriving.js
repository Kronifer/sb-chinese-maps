import * as turf from "@turf/turf";
import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from 'timers/promises';

const demandData = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "demand_data.json"), "utf-8"));

async function processPopsWithConcurrency(pops, concurrency = 5) {
    let drivingPaths = {};
    for (let i = 0; i < pops.length; i += concurrency) {
        const batch = pops.slice(i, i + concurrency);
        await Promise.all(batch.map(async (pop) => {
            const origin = demandData.points.find((point) => point.id === pop.residenceId);
            const destination = demandData.points.find((point) => point.id === pop.jobId);

            if (origin && destination) {
                console.log("Calculating driving path for pop:", pop.id);
                let req;
                try {
                    req = await fetch(`http://localhost:5000/route/v1/driving/${origin.location[0]},${origin.location[1]};${destination.location[0]},${destination.location[1]}?overview=full&geometries=geojson`);
                } catch (error) {
                    await sleep(100); // Wait for 1 second before retrying
                    req = await fetch(`http://localhost:5000/route/v1/driving/${origin.location[0]},${origin.location[1]};${destination.location[0]},${destination.location[1]}?overview=full&geometries=geojson`);
                }
                console.log("Request finished for pop:", pop.id);
                let data = await req.json();
                if(!data.routes) {
                    return;
                }
                let initialGeom = turf.lineString(data.routes[0].geometry.coordinates);
                let simplifiedGeom = turf.simplify(initialGeom, {tolerance: 0.00005, highQuality: true});
                drivingPaths[`${pop.id}`] = simplifiedGeom.geometry.coordinates;
            }
        }));
    }
    return drivingPaths;
}

(async () => {
    let drivingPaths = await processPopsWithConcurrency(demandData.pops, 5);

    fs.writeFileSync(path.join(import.meta.dirname, "driving_paths.json"), JSON.stringify(drivingPaths), "utf-8");
})();
