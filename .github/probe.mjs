import { spawnSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";

let [label, projects, workers] = process.argv.slice(2);
let cacheDirectory = `/tmp/probe-jest-cache-${label}`;
rmSync(cacheDirectory, { recursive: true, force: true });

function run(pass) {
  let outputFile = `/tmp/probe-${label}-${pass}.json`;
  let args = [
    "jest",
    "--selectProjects",
    ...projects.split(","),
    "--cacheDirectory",
    cacheDirectory,
    "--json",
    "--outputFile",
    outputFile,
  ];
  if (workers !== "default") {
    args.push("--maxWorkers", workers);
  }
  let started = Date.now();
  let result = spawnSync("npx", args, { stdio: ["ignore", "ignore", "ignore"] });
  let wall = (Date.now() - started) / 1000;
  let report = JSON.parse(readFileSync(outputFile, "utf8"));
  let files = report.testResults.map(function (file) {
    let testTime = file.assertionResults.reduce((sum, test) => sum + (test.duration ?? 0), 0);
    let runtime = file.endTime - file.startTime;
    return {
      name: file.name.replace(/^.*\/apps\/mobile\//, ""),
      runtime: runtime / 1000,
      testTime: testTime / 1000,
      overhead: (runtime - testTime) / 1000,
      start: (file.startTime - report.startTime) / 1000,
    };
  });
  let sum = (key) => files.reduce((total, file) => total + file[key], 0);
  console.log(
    `[${label} ${pass}] exit ${result.status} wall ${wall.toFixed(1)}s files ${files.length} tests ${report.numTotalTests} passed ${report.numPassedTests} failed ${report.numFailedTests}`
  );
  console.log(
    `[${label} ${pass}] sum file runtime ${sum("runtime").toFixed(1)}s sum test body ${sum("testTime").toFixed(1)}s sum overhead (import, transform, setup) ${sum("overhead").toFixed(1)}s`
  );
  files.sort((a, b) => b.runtime - a.runtime);
  for (let file of files.slice(0, 12)) {
    console.log(
      `[${label} ${pass}]   ${file.runtime.toFixed(1).padStart(5)}s run ${file.testTime.toFixed(1).padStart(5)}s tests ${file.overhead.toFixed(1).padStart(5)}s overhead start +${file.start.toFixed(1).padStart(5)}s ${file.name}`
    );
  }
}

run("cold");
run("warm");
