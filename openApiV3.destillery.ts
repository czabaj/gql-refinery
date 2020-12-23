import { G, OpenAPIV3, R } from "./deps.ts";

import {
  emptySchemaObject,
  getGraphQLTypeName,
  graphqlCompliantMediaType,
  isAlgebraic,
  isEnum,
  isList,
  isObject,
  isScalar,
  withDereferenceMemoized,
} from "./openApiV3.utils.ts";
import { stringify } from "./log.ts";
import { ApiArtifacts, HttpMethod } from "./types.d.ts";
import {
  convertOpenApiPathParamsToColonParams,
  httpMethods,
  isSuccessStatusCode,
  isValidGraphQLName,
} from "./utils.ts";

type DistillContext = {
  apiArtifacts: ApiArtifacts;
  document: OpenAPIV3.Document;
  mutations: Record<string, G.GraphQLFieldConfig<unknown, unknown>>;
  queries: Record<string, G.GraphQLFieldConfig<unknown, unknown>>;
};

const distillInputType = ({ document }: DistillContext) =>
  withDereferenceMemoized<
    OpenAPIV3.ArraySchemaObject | OpenAPIV3.SchemaObject,
    G.GraphQLOutputType
  >(
    document,
    (oasType, parentName) => R.cond([
      [isAlgebraic],
      [isEnum],
      [isList],
      [isObject],
      [isScalar]
    ]),
  );

const distillOutputType = ({ document }: DistillContext) =>
  withDereferenceMemoized<
    OpenAPIV3.ArraySchemaObject | OpenAPIV3.SchemaObject,
    G.GraphQLOutputType
  >(
    document,
    (oasType, parentName) => R.cond([]),
  );

const distillResponse = (
  context: DistillContext,
  distillOutputTypeWContext: ReturnType<typeof distillOutputType>,
) =>
  withDereferenceMemoized<
    OpenAPIV3.ResponseObject,
    // deno-lint-ignore no-explicit-any
    G.GraphQLFieldConfig<any, any, any>
  >(
    context.document,
    (response, parentName) => {
      return {
        description: response.description,
        type: distillOutputTypeWContext(
          graphqlCompliantMediaType(response),
          parentName,
        ),
      };
    },
  );

export const distillOperation = (
  context: DistillContext,
  distillResponseWContext: ReturnType<typeof distillResponse>,
) => {
  const { apiArtifacts: { operations }, mutations, queries } = context;
  return (
    path: string,
    httpMethod: HttpMethod,
    operation: OpenAPIV3.OperationObject,
  ) => {
    const { operationId, responses } = operation;
    if (!operationId) {
      throw new Error(`OpenApi operation MUST contain "operationId".
      ${
        stringify(operation, { maxDepth: 1 })
      }\n\nAbove operation miss "operationId" property.`);
    }
    if (!isValidGraphQLName(operationId)) {
      throw new Error(`OpenApi operationId MUST be a valid GraphQL name.
      ${
        stringify(operation, { maxDepth: 1 })
      }\n\nAbove operation has invalid "operationId".`);
    }
    const groupedResponses = responses &&
      Object.entries(responses).reduce(
        (acc, [httpStatusCode, operation]) => {
          const key = isSuccessStatusCode(httpStatusCode) ? `success` : `error`;
          acc[key] = (acc[key] || []).concat(operation);
          return acc;
        },
        {} as {
          error?: Array<OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject>;
          success?: Array<OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject>;
        },
      );
    if (R.isEmpty(groupedResponses?.success)) {
      throw new Error(`OpenApi operation MUST contain success response.
      ${
        stringify(operation, { maxDepth: 1 })
      }\n\nAbove operation does not contain definition of success response.`);
    }
    if (groupedResponses!.success!.length > 1) {
      throw new Error(`Currently only single success response is supported.
      ${
        stringify(operation, { maxDepth: 1 })
      }\n\nAbove operation contains more than one success response definition, which currently is not supported.`);
    }
    groupedResponses!.error?.forEach((response) => {
      distillResponseWContext(response, operationId);
    });
    const successResponse = groupedResponses!.success![0];
    const gqlFieldConfig = distillResponseWContext(
      successResponse,
      operationId,
    );
    const rootField = httpMethod === `get` ? queries : mutations;
    rootField[operationId] = gqlFieldConfig;
    operations.push({
      httpMethod,
      operationId,
      path,
      responseType: getGraphQLTypeName(gqlFieldConfig.type),
    });
  };
};

export const toGraphQL = (
  document: OpenAPIV3.Document,
) => {
  const context: DistillContext = {
    apiArtifacts: {
      enums: {},
      objectsRelation: {},
      operations: [],
      possibleTypes: {},
    },
    document,
    mutations: {},
    queries: {},
  };
  const distillOutputTypeWContext = distillOutputType(context);
  const distillResponseWContext = distillResponse(
    context,
    distillOutputTypeWContext,
  );
  const distillOperationWContext = distillOperation(
    context,
    distillResponseWContext,
  );
  for (const [urlPath, pathItemObject] of Object.entries(document.paths)) {
    const colonParamsPath = convertOpenApiPathParamsToColonParams(urlPath);
    for (const httpMethod of httpMethods) {
      if (httpMethod in pathItemObject) {
        distillOperationWContext(
          colonParamsPath,
          httpMethod,
          pathItemObject[httpMethod] as OpenAPIV3.OperationObject,
        );
      }
    }
  }
  const { apiArtifacts, mutations, queries } = context;
  const schema = new G.GraphQLSchema({
    query: R.isEmpty(queries)
      ? distillOutputTypeWContext(
        emptySchemaObject,
        `Query`,
      ) as G.GraphQLObjectType
      : new G.GraphQLObjectType({
        name: `Query`,
        fields: queries,
      }),
    mutation: R.isEmpty(mutations) ? null : new G.GraphQLObjectType({
      name: `Mutation`,
      fields: mutations,
    }),
  });
  return { apiArtifacts, schema };
};
