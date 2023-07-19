#!/usr/bin/env node
import { watch } from "./index";
import yargs = require("yargs");

export interface CliOptions {
    interval: number;
    repo: string;
}

function gatherOptions(): CliOptions | Promise<CliOptions> {
    return yargs
        .usage(`usage: $0 [options]
negate any boolean option by prepending --no-`)
        .option("interval", {
            type: "number",
            default: 30
        }).option("repo", {
            type: "string",
            demandOption: false,
            default: "."
        }).argv;
}

(async function main() {
    const args = await gatherOptions();
    await watch(args);
})();
