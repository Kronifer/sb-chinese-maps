import fs from "node:fs";
import path from "node:path";
import * as turf from "@turf/turf";
import seedrandom from "seedrandom";

const rng = seedrandom("PEK2026");

const areas = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "grid.geojson"), "utf-8"));

let points = [];

let idTicker = 0;
let uniCounter = 0;

let buptCount = 0;
let beihangCount = 0;
let bitCount = 0;
let cucCount = 0;
let forestryCount = 0;
let cumtCount = 0;
let jiaotongCount = 0;
let minzuCount = 0;
let normalCount = 0;
let pekingCount = 0;
let renminCount = 0;
let tsinghuaCount = 0;
let ucasCount = 0;
let ustBeijingCount = 0;

areas.features.forEach((area) => {
    if(area.properties.isBUPT) {
        buptCount++;
    } if (area.properties.isBeihang) {
        beihangCount++;
    } if (area.properties.isBIT) {
        bitCount++;
    } if (area.properties.isCUC) {
        cucCount++;
    } if (area.properties.isForestry) {
        forestryCount++;
    } if (area.properties.isCUMT) {
        cumtCount++;
    } if (area.properties.isJiaotong) {
        jiaotongCount++;
    } if (area.properties.isMinzu) {
        minzuCount++;
    } if (area.properties.isNormal) {
        normalCount++;
    } if (area.properties.isPeking) {
        pekingCount++;
    } if (area.properties.isRenmin) {
        renminCount++;
    } if (area.properties.isTsinghua) {
        tsinghuaCount++;
    } if (area.properties.isUCAS) {
        ucasCount++;
    } if (area.properties.isUSTBeijing) {
        ustBeijingCount++;
    }
});

areas.features.forEach((area) => {
    let point = {
        residents: 0,
        jobs: area.properties.JOBS,
        possibleResidents: area.properties.RESIDENTS,
        id: `${idTicker++}`,
        popIds: [],
        remainingJobs: area.properties.JOBS
    }
    if(area.properties.isCapital2) {
        point.id = `AIR_PEK_T2`;
        point.jobs += Math.round(116289 * (30/100));
        point.remainingJobs += Math.round(116289 * (30/100));
    } else if(area.properties.isCapital3) {
        point.id = `AIR_PEK_T3`;
        point.jobs += Math.round(116289 * (70/100));
        point.remainingJobs += Math.round(116289 * (70/100));
    } else if(area.properties.isDaxing) {
        point.id = `AIR_PKX_T1`;
        point.jobs += Math.round(95485);
        point.remainingJobs += Math.round(95485);
    }
    else if(area.properties.isBeijingFengtai) {
        point.id = `AIR_Beijing Fengtai_T1`;
        point.jobs += 105479;
        point.remainingJobs += 105479;
    } else if(area.properties.isBeijingNorth) {
        point.id = `AIR_Beijing North_T1`;
        point.jobs += 42191;
        point.remainingJobs += 42191;
    } else if(area.properties.isBeijingSouth) {
        point.id = `AIR_Beijing South_T1`;
        point.jobs += 278082;
        point.remainingJobs += 278082;
    } else if(area.properties.isBeijingStation) {
        point.id = `AIR_Beijing Station_T1`;
        point.jobs += 115068;
        point.remainingJobs += 115068;
    } else if(area.properties.isBeijingWest) {
        point.id = `AIR_Beijing West_T1`;
        point.jobs += 250849;
        point.remainingJobs += 250849;
    }
    if(area.properties.isBUPT) {
        point.id = `UNI_BUPT_${uniCounter++}`;
        point.jobs += Math.round(27000 / buptCount);
        point.remainingJobs += Math.round(27000 / buptCount);
    } if(area.properties.isBeihang) {
        point.id = `UNI_Beihang_${uniCounter++}`;
        point.jobs += Math.round(22805 / beihangCount);
        point.remainingJobs += Math.round(22805 / beihangCount);
    } if(area.properties.isBIT) {
        point.id = `UNI_BIT_${uniCounter++}`;
        point.jobs += Math.round(26358 / bitCount);
        point.remainingJobs += Math.round(26358 / bitCount);
    } if(area.properties.isCUC) {
        point.id = `UNI_CUC_${uniCounter++}`;
        point.jobs += Math.round(14623 / cucCount);
        point.remainingJobs += Math.round(14623 / cucCount);
    } if(area.properties.isForestry) {
        point.id = `UNI_Forestry_${uniCounter++}`;
        point.jobs += Math.round(18378 / forestryCount);
        point.remainingJobs += Math.round(18378 / forestryCount);
    } if(area.properties.isCUMT) {
        point.id = `UNI_CUMT_${uniCounter++}`;
        point.jobs += Math.round(35000 / cumtCount);
        point.remainingJobs += Math.round(35000 / cumtCount);
    } if(area.properties.isJiaotong) {
        point.id = `UNI_Jiaotong_${uniCounter++}`;
        point.jobs += Math.round(22656 / jiaotongCount);
        point.remainingJobs += Math.round(22656 / jiaotongCount);
    } if(area.properties.isMinzu) {
        point.id = `UNI_Minzu_${uniCounter++}`;
        point.jobs += Math.round(15800 / minzuCount);
        point.remainingJobs += Math.round(15800 / minzuCount);
    } if(area.properties.isNormal) {
        point.id = `UNI_Normal_${uniCounter++}`;
        point.jobs += Math.round(38718 / normalCount);
        point.remainingJobs += Math.round(38718 / normalCount);
    } if(area.properties.isPeking) {
        point.id = `UNI_Peking_${uniCounter++}`;
        point.jobs += Math.round(49821 / pekingCount);
        point.remainingJobs += Math.round(49821 / pekingCount);
    } if(area.properties.isRenmin) {
        point.id = `UNI_Renmin_${uniCounter++}`;
        point.jobs += Math.round(27810 / renminCount);
        point.remainingJobs += Math.round(27810 / renminCount);
    } if(area.properties.isTsinghua) {
        point.id = `UNI_Tsinghua_${uniCounter++}`;
        point.jobs += Math.round(62496 / tsinghuaCount);
        point.remainingJobs += Math.round(62496 / tsinghuaCount);
    } if(area.properties.isUCAS) {
        point.id = `UNI_UCAS_${uniCounter++}`;
        point.jobs += Math.round(57651 / ucasCount);
        point.remainingJobs += Math.round(57651 / ucasCount);
    } if(area.properties.isUSTBeijing) {
        point.id = `UNI_USTBeijing_${uniCounter++}`;
        point.jobs += Math.round(27311 / ustBeijingCount);
        point.remainingJobs += Math.round(27311 / ustBeijingCount);
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
const MEDIAN_COMMUTE_KM = 13.2;
const LAMBDA = (2 / MEDIAN_COMMUTE_KM); // For exponential distribution of commute distances
const assigned = new Map(points.map(p => [p.id, 0]));
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
                    const randomComponent = 0.2 + rng() * 0.8 * Math.exp(-LAMBDA * effectiveDistance);
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