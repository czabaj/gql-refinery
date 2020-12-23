import { parse } from "https://deno.land/std@0.80.0/flags/mod.ts";

import { processSpecificationFile } from "./refinery.ts";
import { toAbsolutePath } from "./utils.ts";

const args = parse(Deno.args, {
  default: {
    outputDir: `./`,
  },
});

const { _: [specFile], outputDir } = args;

// console.dir(args);

processSpecificationFile(specFile as string);
