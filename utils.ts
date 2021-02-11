import snakeCase from "https://raw.githubusercontent.com/lodash/lodash/master/snakeCase.js";

import { G, R } from "./deps.ts";
import { HttpMethod } from "./types.d.ts";

/**
 * Converts OpenAPI URL path parameters (e.g. "/{parameter}") to colon parameters (e.g. "/:parameter")
 */
export const convertOpenApiPathParamsToColonParams: (uri: string) => string =
  // deno-lint-ignore no-explicit-any
  (R as any).replace(/\/\{(\w+)\}(?=\/|$)/g, `/:$1`);

export const getGraphQLTypeName = (
  outputType: G.GraphQLOutputType,
): string | undefined =>
  // deno-lint-ignore no-explicit-any
  (outputType as any).ofType
    ? // deno-lint-ignore no-explicit-any
      getGraphQLTypeName((outputType as any).ofType)
    : G.isScalarType(outputType)
    ? undefined
    : // deno-lint-ignore no-explicit-any
      (outputType as any).name;

// currently don't care about "head" and "options"
export const httpMethods: HttpMethod[] = [
  `delete`,
  `get`,
  `patch`,
  `post`,
  `put`,
];

export const isSuccessStatusCode = (statusCode: string): boolean =>
  statusCode.startsWith(`2`);

export const isValidGraphQLName = RegExp.prototype.test.bind(/^[A-Za-z_]\w*$/);

// deno-lint-ignore no-explicit-any
export const toUpperSnakeCase = (R as any).compose(
  R.toUpper,
  snakeCase,
);

const invalidTokensRe = /^[^A-Za-z_]|\W+(.)?/g;
export const toValidGraphQLName = (name: string): string =>
  name.replace(
    invalidTokensRe,
    (_match, charAfter) => charAfter?.toUpperCase() || ``,
  );
