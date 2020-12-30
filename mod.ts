import { parse } from "https://deno.land/std@0.80.0/flags/mod.ts";

import { convert } from "./refinery.ts";

const args = parse(Deno.args, {
  default: {
    outputDir: `./`,
  },
});

const { _: [specFile], outputDir } = args;

convert(specFile as string, outputDir as string);
