import { parse } from "https://deno.land/std@0.80.0/flags/mod.ts";

import { main } from "./node/mod.mjs";
import { loadFile } from "./src/utils/deno.loadFile.ts";

const args = parse(Deno.args, {
  default: {
    outputDir: `./`,
  },
});

await main(args as any, { loadFile, writeTextFile: Deno.writeTextFile });
