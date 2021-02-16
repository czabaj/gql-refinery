#!/usr/bin/env node

import { promises as fs } from "fs";

import yaml from "js-yaml";
import minimist from "minimist";

import { main } from "./mod.mjs";

const loadFile = async (path) => {
  const fileContent = () => fs.readFile(path, `utf8`);
  if (path.endsWith(".json")) {
    return JSON.parse(await fileContent());
  }
  if (/\.ya?ml$/.test(path)) {
    return yaml.load(await fileContent());
  }
  throw new Error(
    `Cannot load file "${path}"./n/nOnly .json and .yml or .yaml are supported`
  );
};

const args = minimist(process.argv.slice(2), {
  default: {
    outputDir: `./`,
  },
});

const {
  _: [specFile],
  outputDir,
} = args;

console.log("arg", args);

main(args, { loadFile, writeTextFile: fs.writeFile });
