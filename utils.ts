import * as YAML from "https://deno.land/std@0.80.0/encoding/yaml.ts";

import { G } from "./deps.ts";
import { AnyObject, HttpMethod } from "./types.d.ts";

const paramRe = /\/\{(.+)\}(?=\/|$)/g;
/**
 * Converts OpenAPI URL path parameters (e.g. "/{parameter}") to colon parameters (e.g. "/:parameter")
 */
export const convertOpenApiPathParamsToColonParams = (uri: string): string =>
  uri.replace(paramRe, `/:$1`);

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

const invalidTokensRe = /^[^A-Za-z_]|\W+(.)?/g;
export const toValidGraphQLName = (name: string): string =>
  name.replace(
    invalidTokensRe,
    (_match, charAfter) => charAfter?.toUpperCase() || ``,
  );

export const loadFile = async <T = AnyObject>(filePath: string): Promise<T> => {
  const fileContent = () => Deno.readTextFile(filePath);
  if (filePath.endsWith(".json")) {
    return JSON.parse(await fileContent());
  }
  if (/\.ya?ml$/.test(filePath)) {
    return YAML.parse(await fileContent()) as T;
  }
  throw new Error(
    `Cannot load file "${filePath}"./n/nOnly .json and .yml or .yaml are supported`,
  );
};

export const getGraphQLTypeName = (
  outputType: G.GraphQLOutputType,
): string | undefined =>
  G.isObjectType(outputType)
    ? outputType.name
    : G.isListType(outputType)
    ? getGraphQLTypeName(outputType.ofType)
    : undefined;
