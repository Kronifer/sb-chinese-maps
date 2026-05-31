import fs from "node:fs";
import path from "node:path";
import * as turf from "@turf/turf";
import seedrandom from "seedrandom";

const rng = seedrandom("CAN2026");

const areas = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "grid.geojson"), "utf-8"));

let points = [];

let idTicker = 0;
let terminalCounter = 1;
let uniCounter = 0;

areas.features.forEach((area) => {
    let point = {
        residents: 0,
        jobs: area.properties.JOBS,
        possibleResidents: area.properties.RESIDENTS,
        id: `${idTicker++}`,
        popIds: [],
        remainingJobs: area.properties.JOBS
    }
    if(area.properties.isAirport) {
        point.id = `AIR_CAN_T${terminalCounter++}`;
        point.jobs += Math.floor(104109 / 2);
        point.remainingJobs += Math.floor(104109 / 2);
    }
    else if(area.properties.isSunYatSen) {
        point.id = `UNI_SUNYATSEN_${uniCounter++}`;
        point.jobs += Math.floor(56047/ 15);
        point.remainingJobs += Math.floor(56047/ 15);
    }
    else if(area.properties.isScut) {
        point.id = `UNI_SCUT_${uniCounter++}`;
        point.jobs += Math.floor(45357/9);
        point.remainingJobs += Math.floor(45357/9);
    } else if(area.properties.isJinan) {
        point.id = `UNI_JINAN_${uniCounter++}`;
        point.jobs += Math.floor(50000/7);
        point.remainingJobs += Math.floor(50000/7);
    }
    point.location = turf.centroid(area).geometry.coordinates;
    points.push(point);
})

let pops = [];

const MIN_POP_SIZE = 1;
const MAX_POP_SIZE = 200;
const DRIVING_SPEED_KPH = 30;
const USE_OSRM = true;

// Constants for more realistic commute patterns
const SURPRISE_LONG_COMMUTE_RATE = 0.01; // 5% chance of surprise long commute
const GRAVITY_WEIGHT = 0.8; // Weight for gravity component
const RANDOM_WEIGHT = 0.2; // Weight for random component
const MIN_PROBABILITY = 0.001; // Minimum probability for any job

let pointsProcessed = 0;
let popsToProcess = points.length;
const MEDIAN_COMMUTE_KM = 9.5;
const LAMBDA = (2.5 / MEDIAN_COMMUTE_KM); // For exponential distribution of commute distances
const assigned = new Map(points.map(p => [p.id, 0]));
points.sort(() => rng() - 0.5); // Shuffle points to avoid processing in a fixed order
async function generatePoints() {
    for(const point of points) {
        let commuteLengths = [];
        let totalPops = 0;
        let workersLeft = point.remainingJobs;
        while(workersLeft > MIN_POP_SIZE) {
            let popSize = 0;
            if(workersLeft < MIN_POP_SIZE * 2) {
                popSize = workersLeft;
            }
            else if(workersLeft <= MAX_POP_SIZE + MIN_POP_SIZE) {
                popSize = Math.floor(workersLeft / 2);
            } else {
                popSize = MIN_POP_SIZE + Math.floor(rng() * (MAX_POP_SIZE - MIN_POP_SIZE));
            }

            const jobOptions = points
                .filter((j) => j.id !== point.id && j.possibleResidents > popSize)
                .map((j) => {
                    const distance = turf.distance(turf.point(point.location), turf.point(j.location), { units: "kilometers" });
                    let score = 0;
                    
                    const effectiveDistance = point.id.startsWith("AIR_")
                        ? Math.max(distance * 0.3, 1)
                        : point.id.startsWith("UNI_")
                        ? Math.max(distance * 0.5, 1)
                        : distance;
                    const utilisation = assigned.get(j.id) / j.possibleResidents;
                    //const availabilityPenalty = Math.exp(-utilisation * 3); // softly decays as zone fills
                    const gravityComponent = Math.log(j.possibleResidents) * Math.exp(-LAMBDA * effectiveDistance);
                    const randomComponent = (0.2 + rng() * 0.8) * Math.exp(-LAMBDA * effectiveDistance);
                    score = GRAVITY_WEIGHT * gravityComponent + RANDOM_WEIGHT * randomComponent;
                    if (rng() < SURPRISE_LONG_COMMUTE_RATE && distance > 2*MEDIAN_COMMUTE_KM) {
                        score += GRAVITY_WEIGHT * gravityComponent * 2;
                    }
                    score = Math.max(score, MIN_PROBABILITY);
                    
                    return {j, distance, score};
                });
            if(jobOptions.length === 0) {
                break;
            }

            const totalWeight = jobOptions.reduce((sum, j) => sum + j.score, 0);
            let target = rng() * totalWeight;
            const selected = jobOptions.find((j) => (target -= j.score) <= 0) || jobOptions[0];

            let drivingMeters = 0;
            let drivingSeconds = 0;

            if(USE_OSRM) {
                try {
                    const resp = await fetch("http://127.0.0.1:5000/route/v1/driving/" + point.location[0] + "," + point.location[1] + ";" + selected.j.location[0] + "," + selected.j.location[1] + "?overview=false");
                    const data = await resp.json();
                    if(data.code === "Ok" && data.routes.length > 0) {
                        drivingMeters = data.routes[0].distance;
                        drivingSeconds = data.routes[0].duration;
                    } else {
                        console.warn(`OSRM routing failed for ${point.id} to ${selected.j.id}, falling back to straight-line distance.`);
                        drivingMeters = turf.distance(turf.point(point.location), turf.point(selected.j.location), { units: "kilometers" }) * 1000;
                        drivingSeconds = (drivingMeters / (DRIVING_SPEED_KPH * 1000 / 3600));
                    }
                } catch (error) {
                    console.warn(`OSRM routing failed for ${point.id} to ${selected.j.id}, falling back to straight-line distance.`);
                    drivingMeters = turf.distance(turf.point(point.location), turf.point(selected.j.location), { units: "kilometers" }) * 1000;
                    drivingSeconds = (drivingMeters / (DRIVING_SPEED_KPH * 1000 / 3600));
                }

            } else {
                drivingMeters = turf.distance(turf.point(point.location), turf.point(selected.j.location), { units: "kilometers" }) * 1000;
                drivingSeconds = drivingMeters / ((DRIVING_SPEED_KPH * 1000) / 3600);
            }

            const pop = {
                id: `${idTicker++}`,
                size: popSize,
                residenceId: selected.j.id,
                jobId: point.id,
                drivingSeconds: Math.round(drivingSeconds),
                drivingDistance: Math.round(drivingMeters)
            }

            pops.push(pop);
            point.popIds.push(pop.id);
            selected.j.popIds.push(pop.id);
            selected.j.residents += popSize;
            assigned.set(selected.j.id, assigned.get(selected.j.id) + popSize);
            workersLeft -= popSize;
            totalPops += 1;
            commuteLengths.push(drivingMeters);
        }
        let medianCommute = commuteLengths.sort((a, b) => a - b)[Math.floor(commuteLengths.length / 2)] / 1000;
        console.log(`Processed ${++pointsProcessed}/${popsToProcess} points... (${totalPops} pops, median commute ${(medianCommute).toFixed(2)} km)`);
    }
}

await generatePoints();

for(const point of points) {
    delete point.possibleResidents;
    delete point.remainingJobs;
}

fs.writeFileSync(path.join(import.meta.dirname, "demand_data.json"), JSON.stringify({points: points, pops: pops}, null, 2), "utf-8");