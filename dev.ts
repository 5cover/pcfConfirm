#!/usr/bin/env ts-node

import chokidar from "chokidar";
import { spawn } from "child_process";
import path from "path";

const controlName = process.argv[2];
if (!controlName) {
    console.error("Usage: dev.ts <ControlName>");
    process.exit(1);
}

const outDir = path.resolve(`out/controls/${controlName}`);

let harnessProcess: ReturnType<typeof spawn> | undefined = undefined;

function buildControl(): Promise<void> {
    console.log(`[build] Building ${controlName}...`);
    return new Promise<void>((resolve, reject) => {
        const build = spawn("npx", ["pcf-scripts", "build", "--control", controlName], { stdio: "inherit" });
        build.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`[build] Build failed with code ${code}`));
        });
    });
}

function startHarness() {
    console.log(`[harness] Starting Microsoft test harness...`);
    harnessProcess = spawn("npx", ["pcf-start", "--codePath", outDir], { stdio: "inherit" });
}

function stopHarness() {
    if (harnessProcess) {
        console.log(`[harness] Stopping old test harness...`);
        harnessProcess.kill();
        harnessProcess = undefined;
    }
}

// Initial build + serve
(async () => {
    await buildControl();

    startHarness();

    console.log(`[watch] Watching control files...`);

    const controlDir = path.resolve(controlName);  // Absolute path
    const tsGlob = path.join(controlDir, "**/*.ts");
    const cssGlob = path.join(controlDir, "**/*.css");
    const resxGlob = path.join(controlDir, "strings/**/*.resx");
    const manifestFile = path.join(controlDir, "ControlManifest.Input.xml");
    console.log([tsGlob, cssGlob, resxGlob, manifestFile]);
    chokidar.watch([tsGlob, cssGlob, resxGlob, manifestFile], {
        ignoreInitial: true,
        /*awaitWriteFinish: {
            stabilityThreshold: 1000,
            pollInterval: 100
        }*/
    }).on("all", async (event, filePath) => {
        console.log(`[watch] Detected ${event} on ${filePath}`);
        stopHarness();
        await buildControl();
        startHarness();
    });
})();