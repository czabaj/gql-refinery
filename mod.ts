import { G, R } from "./deps.ts";
import { stringify } from "./log.ts";
import { toGraphQL } from "./openApiV3.destillery.ts";
import { isOpenAPIV3Document } from "./openApiV3.utils.ts";
import { ApiArtifacts, Enums, NonBodyArg, PossibleType } from "./types.d.ts";
import {
  convertOpenApiPathParamsToColonParams,
  getGraphQLTypeName,
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

export const convert = async (openApi: Record<string, unknown>) => {
  if (!isOpenAPIV3Document(openApi)) {
    throw new Error(
      `File does not contain a valid OpenAPIV3 document:

      ${stringify(openApi, { maxDepth: 1 })}`,
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
    openApi,
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
      onOperationDistilled(
        url,
        httpMethod,
        operationId,
        fieldConfig,
        parameters,
      ) {
        const nonBodyParameters = parameters?.reduce(
          (acc, param) => {
            if (param.in !== "body") {
              acc.push(
                {
                  in: param.in,
                  name: param.name,
                  originalName: param.originalName,
                },
              );
            }
            return acc;
          },
          [] as Array<{ in: NonBodyArg; name: string; originalName?: string }>,
        );

        operations.push({
          httpMethod,
          operationId,
          path: convertOpenApiPathParamsToColonParams(url),
          responseType: getGraphQLTypeName(fieldConfig.type),
          parameters: R.isEmpty(nonBodyParameters)
            ? undefined
            : nonBodyParameters,
        });
      },
    },
  );

  const possibleTypes = await getPossibleTypes(gqlSchema);
  return {
    apiArtifacts: { ...apiArtifacts, possibleTypes } as ApiArtifacts,
    enums,
    openApi,
    gqlSchema,
  };
};
