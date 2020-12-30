import * as path from "https://deno.land/std/path/mod.ts";

import { G } from "./deps.ts";
import { color, log, stringify } from "./log.ts";
import { toGraphQL } from "./openApiV3.destillery.ts";
import { isOpenAPIV3Document } from "./openApiV3.utils.ts";
import { ApiArtifacts } from "./types.d.ts";
import {
  convertOpenApiPathParamsToColonParams,
  getGraphQLTypeName,
  loadFile,
} from "./utils.ts";

export const convert = async (specFile: string, outputDir: string) => {
  log(color.blue(`Loading file: ${specFile}`));
  const content = await loadFile(specFile);
  if (!isOpenAPIV3Document(content)) {
    throw new Error(
      `File does not contain a valid OpenAPIV3 document:

      ${stringify(content, { maxDepth: 1 })}`,
    );
  }

  const { enums, objectsRelation, operations, possibleTypes }: ApiArtifacts = {
    enums: {},
    objectsRelation: {},
    operations: [],
    possibleTypes: {},
  };

  const gqlSchema = toGraphQL(
    content,
    {
      onOperationDistilled(path, httpMethod, operationId, fieldConfig) {
        operations.push({
          httpMethod,
          operationId,
          path: convertOpenApiPathParamsToColonParams(path),
          responseType: getGraphQLTypeName(fieldConfig.type),
        });
      },
    },
  );

  await Deno.writeTextFile(
    path.join(outputDir, `schema.graphql`),
    G.printSchema(gqlSchema),
  );
};
