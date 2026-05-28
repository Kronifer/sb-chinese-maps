import fs from "fs";

const demand = JSON.parse(fs.readFileSync(process.argv[2]));

let pointSizes = demand.points.map(point => point.jobs);
let popSizes = demand.pops.map(pop => pop.size);
let popDriveDistances = demand.pops.map(pop => pop.drivingDistance);
let popDriveSeconds = demand.pops.map(pop => pop.drivingSeconds);

console.log("Mean point size:", pointSizes.reduce((a, b) => a + b, 0) / pointSizes.length);
console.log("Mean pop size:", popSizes.reduce((a, b) => a + b, 0) / popSizes.length);
console.log("Mean pop driving distance:", popDriveDistances.reduce((a, b) => a + b, 0) / popDriveDistances.length);
console.log("Mean pop driving time:", popDriveSeconds.reduce((a, b) => a + b, 0) / popDriveSeconds.length);

let medianPointSize = pointSizes.sort((a, b) => a - b)[Math.floor(pointSizes.length / 2)];
let medianPopSize = popSizes.sort((a, b) => a - b)[Math.floor(popSizes.length / 2)];
let medianPopDriveDistance = popDriveDistances.sort((a, b) => a - b)[Math.floor(popDriveDistances.length / 2)];
let medianPopDriveSeconds = popDriveSeconds.sort((a, b) => a - b)[Math.floor(popDriveSeconds.length / 2)];

console.log("Median point size:", medianPointSize);
console.log("Median pop size:", medianPopSize);
console.log("Median pop driving distance:", medianPopDriveDistance);
console.log("Median pop driving time:", medianPopDriveSeconds);