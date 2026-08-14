import fs from "node:fs";
import path from "node:path";

const cityCode = "XMN"

const data = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "..", cityCode, "demand_data.json"), "utf-8"));

const filteredPoints = data.points.filter((point) => point.popIds.length > 0);

fs.writeFileSync(path.join(import.meta.dirname, "..", cityCode, "filtered_demand_data.json"), JSON.stringify({ points: filteredPoints, pops: data.pops}), "utf-8");