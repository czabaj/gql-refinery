import { parse } from "https://deno.land/std@0.80.0/flags/mod.ts";
import * as path from "https://deno.land/std@0.80.0/path/mod.ts";

import { loadFile } from "./deno.utils.ts";
import { G, OpenAPIV3 } from "./deps.ts";
import { color, log, stringify } from "./log.ts";
import { convert } from "./mod.ts";
import { printEnums } from "./typeScript.enumPrinter.ts";
import { ApiArtifacts, Enums } from "./types.d.ts";

const args = parse(Deno.args, {
  default: {
    outputDir: `./`,
  },
});

const { _: [specFile], outputDir } = args;

log(color.blue(`Loading file:\t${specFile}`));

const fileContent = await loadFile(specFile as string);
const { apiArtifacts, enums, gqlSchema, openApi } = await convert(
  fileContent,
);

const writeOutputFile = (fileName: string, content: string) => {
  log(color.blue(`Writting file:\t${fileName}`));
  return Deno.writeTextFile(fileName, content);
};

const writeApiArtifacts = (
  apiArtifacts: ApiArtifacts,
  outputDir: string,
) =>
  writeOutputFile(
    path.join(outputDir, `apiArtifacts.json`),
    stringify(apiArtifacts, null, 2),
  );

const writeTsTypes = (enums: Enums, outputDir: string) =>
  writeOutputFile(path.join(outputDir, `tsTypes.ts`), printEnums(enums));

const writeGraphQLSchema = (gqlSchema: G.GraphQLSchema, outputDir: string) =>
  writeOutputFile(
    path.join(outputDir, `schema.graphql`),
    G.printSchema(gqlSchema),
  );

const writeOpenAPIJson = (
  oasDocument: OpenAPIV3.Document,
  outputDir: string,
) =>
  writeOutputFile(
    path.join(outputDir, `openapi.json`),
    stringify(oasDocument, null, 2),
  );

await Promise.all([
  writeApiArtifacts(apiArtifacts, outputDir),
  writeGraphQLSchema(gqlSchema, outputDir),
  writeOpenAPIJson(openApi, outputDir),
  writeTsTypes(enums, outputDir),
]);

log(color.green(`ALL DONE`));
