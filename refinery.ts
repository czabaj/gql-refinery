import * as path from "https://deno.land/std/path/mod.ts";

import { G, OpenAPIV3, R } from "./deps.ts";
import { color, log, stringify } from "./log.ts";
import { toGraphQL } from "./openApiV3.destillery.ts";
import { isOpenAPIV3Document } from "./openApiV3.utils.ts";
import { printEnums } from "./typeScript.enumPrinter.ts";
import { ApiArtifacts, Enums, PossibleType } from "./types.d.ts";
import {
  convertOpenApiPathParamsToColonParams,
  getGraphQLTypeName,
  loadFile,
} from "./utils.ts";

const getIntrospectionQueryResult = (
  schema: G.GraphQLSchema,
): Promise<{
  data: {
    __schema: {
      types: {
        kind: string;
        name: string;
        possibleTypes?: { name: string; fields: { name: string }[] }[];
      }[];
    };
  };
}> => {
  const document = G.parse(`
  {
    __schema {
      types {
        kind
        name
        possibleTypes {
          name
          fields(includeDeprecated: true) {
            name
          }
        }
      }
    }
  }
`);
  // deno-lint-ignore no-explicit-any
  return (G as any).execute({ document, schema });
};

const getPossibleTypes = async (
  gqlSchema: G.GraphQLSchema,
): Promise<ApiArtifacts["possibleTypes"]> => {
  const { data: { __schema: { types } } } = await getIntrospectionQueryResult(
    gqlSchema,
  );
  const byUniqPropetiesLengthDesc = (a: PossibleType, b: PossibleType) =>
    b.uniqProperties.length - a.uniqProperties.length;
  const toName = ({ name }: { name: string }) => name;
  return types.reduce(
    (acc, { name, possibleTypes: possTypes }) => {
      if (possTypes) {
        const withUniqProps = possTypes.map((
          { fields, name },
        ) => [name, fields.map(toName)] as [string, string[]]).map(
          ([name, properties], idx, arr) => {
            const otherTypesProperties =
              (R.remove(idx, 1, arr) as [string, string[]][])
                .reduce(
                  (acc, [, pNames]) => acc.concat(pNames),
                  [] as string[],
                );
            const uniqProperties = R.difference(
              properties,
              otherTypesProperties,
            );
            return { name, uniqProperties };
          },
        );
        acc[name] = withUniqProps.sort(byUniqPropetiesLengthDesc);
      }
      return acc;
    },
    {} as ApiArtifacts["possibleTypes"],
  );
};

const writeOutputFile = (fileName: string, content: string) => {
  log(color.blue(`Writting file:\t${fileName}`));
  return Deno.writeTextFile(fileName, content);
};

const writeApiArtifacts = async (
  apiArtifacts: ApiArtifacts,
  gqlSchema: G.GraphQLSchema,
  outputDir: string,
) => {
  const possibleTypes = await getPossibleTypes(gqlSchema);
  return writeOutputFile(
    path.join(outputDir, `apiArtifacts.json`),
    stringify({ ...apiArtifacts, possibleTypes }, null, 2),
  );
};

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

export const convert = async (specFile: string, outputDir: string) => {
  log(color.blue(`Loading file:\t${specFile}`));
  const content = await loadFile(specFile);
  if (!isOpenAPIV3Document(content)) {
    throw new Error(
      `File does not contain a valid OpenAPIV3 document:

      ${stringify(content, { maxDepth: 1 })}`,
    );
  }

  const apiArtifacts: ApiArtifacts = {
    objectsRelation: {},
    objectsRename: {},
    operations: [],
    possibleTypes: {},
  };
  const { objectsRename, objectsRelation, operations } = apiArtifacts;
  const enums: Enums = new Map();

  const gqlSchema = toGraphQL(
    content,
    {
      onEnumDistilled(name, source) {
        enums.set(name, source.enum);
      },
      onObjectDistilled(name, gqlObject) {
        const childObjectTypes = Object.entries(gqlObject.getFields()).reduce(
          (acc, [key, field]) => {
            if (G.isObjectType(field.type)) {
              acc.push([key, field.type.name]);
            }
            return acc;
          },
          [] as [string, string][],
        );
        if (!R.isEmpty(childObjectTypes)) {
          objectsRelation[name] = Object.fromEntries(childObjectTypes);
        }
      },
      onPropertyRenamed(objectName, originalName, changedName) {
        (objectsRename[objectName] || (objectsRename[objectName] = {}))[
          originalName
        ] = changedName;
      },
      onOperationDistilled(url, httpMethod, operationId, fieldConfig) {
        operations.push({
          httpMethod,
          operationId,
          path: convertOpenApiPathParamsToColonParams(url),
          responseType: getGraphQLTypeName(fieldConfig.type),
        });
      },
    },
  );

  const possibleTypesPromise = await Promise.all(
    [
      writeApiArtifacts(apiArtifacts, gqlSchema, outputDir),
      writeGraphQLSchema(gqlSchema, outputDir),
      writeOpenAPIJson(content, outputDir),
      writeTsTypes(enums, outputDir),
    ],
  );

  log(color.green(`ALL DONE`));
};
