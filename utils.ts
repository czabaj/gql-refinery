import * as path from "https://deno.land/std@0.80.0/path/mod.ts";
import * as YAML from "https://deno.land/std@0.80.0/encoding/yaml.ts";

import { AnyObject, HttpMethod } from "./types.d.ts";

const paramRe = /\/\{(.+)\}(?=\/|$)/g;
/**
 * Converts OpenAPI URL path parameters (e.g. "/{parameter}") to colon parameters (e.g. "/:parameter")
 */
export const convertOpenApiPathParamsToColonParams = (uri: string): string =>
  uri.replace(paramRe, `/:$1`);

// currently don't care about "head" and "options"
export const httpMethods: HttpMethod[] = [
  "delete",
  "get",
  "patch",
  "post",
  "put",
];

export const isSuccessStatusCode = (statusCode: string): boolean =>
  statusCode.startsWith(`2`);

export const isValidGraphQLName = RegExp.prototype.test.bind(/^[A-Za-z_]\w*$/);

export const loadFile = async (filePath: string): Promise<AnyObject> => {
  const fileContent = () => Deno.readTextFile(filePath);
  if (filePath.endsWith(".json")) {
    return JSON.parse(await fileContent());
  }
  if (/\.ya?ml$/.test(filePath)) {
    return YAML.parse(await fileContent()) as AnyObject;
  }
  throw new Error(
    `Cannot load file "${filePath}"./n/nOnly .json and .yml or .yaml are supported`,
  );
};

/**
 * Converts relative FS path to absolute
 */
export const toAbsolutePath = (p: string): string =>
  path.isAbsolute(p) ? p : path.join(Deno.cwd(), p);
