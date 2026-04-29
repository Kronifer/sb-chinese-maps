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

const MIN_POP_SIZE = 24;
const MAX_POP_SIZE = 200;
const DRIVING_SPEED_KPH = 30;
const USE_OSRM = true;

// Constants for more realistic commute patterns
const STICKY_COMMUTER_RATE = 0.2; // 20% of commuters ignore distance
const SURPRISE_LONG_COMMUTE_RATE = 0.05; // 5% chance of surprise long commute
const GRAVITY_WEIGHT = 0.65; // Weight for gravity component
const RANDOM_WEIGHT = 0.35; // Weight for random component
const MIN_PROBABILITY = 0.001; // Minimum probability for any job

// Distance decay function based on distance bands
function getDistanceDecayPower(distance) {
    if (distance < 15) {
        return 1.0; // Gentle decay for close distances
    } else if (distance < 30) {
        return 1.15;
    } else if (distance < 45) {
        return 1.3; // Medium decay for medium distances
    } else if (distance < 60) {
        return 1.45;
    } else {
        return 1.6; // Steeper decay for long distances
    }
}

let pointsProcessed = 0;
let popsToProcess = points.length;
async function generatePoints() {
    for(const point of points) {
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

            const isStickyCommuter = rng() < STICKY_COMMUTER_RATE;

            const jobOptions = points
                .filter((j) => j.id !== point.id && j.possibleResidents > popSize)
                .map((j) => {
                    const distance = turf.distance(turf.point(point.location), turf.point(j.location), { units: "kilometers" });

                    let score = 0;
                    if (isStickyCommuter) {
                        score = 1;
                    } else {
                        const effectiveDistance = point.id.startsWith("AIR_")
                            ? Math.max(distance * 0.3, 1)
                            : distance;
                        const decayPower = getDistanceDecayPower(effectiveDistance);
                        const gravityComponent = Math.sqrt(j.possibleResidents) / Math.pow(effectiveDistance, decayPower);
                        const randomComponent = 0.2 + rng() * 2.8;
                        score = GRAVITY_WEIGHT * gravityComponent + RANDOM_WEIGHT * randomComponent;

                        if (rng() < SURPRISE_LONG_COMMUTE_RATE && distance > 45) {
                            score *= 10;
                        }

                        score = Math.max(score, MIN_PROBABILITY);
                    }
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
            selected.j.possibleResidents -= popSize;
            selected.j.residents += popSize;
            workersLeft -= popSize;
        }
        console.log(`Processed ${++pointsProcessed}/${popsToProcess} points...`);
    }
}

await generatePoints();

for(const point of points) {
    delete point.possibleResidents;
    delete point.remainingJobs;
}

fs.writeFileSync(path.join(import.meta.dirname, "demand_data.json"), JSON.stringify({points: points, pops: pops}, null, 2), "utf-8");