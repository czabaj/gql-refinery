import { G, OpenAPIV3 } from "./deps.ts";
export type AnyObject = Record<string, unknown>;

export type BODY_ARG = `body`;
export type DistilledOperationParameter = {
  description?: string;
  in: BODY_ARG | `cookie` | `header` | `path` | `query`;
  /**
   * Response body uses reserved name `body`
   */
  name: BODY_ARG | string;
  required: boolean;
  type: G.GraphQLInputType;
};

export type ApiArtifacts = {
  enums: Record<string, string[]>;
  objectsRelation: Record<string, Record<string, string>>;
  operations: Array<{
    httpMethod: HttpMethod;
    operationId: string;
    path: string;
    responseType?: string;
  }>;
  possibleTypes: Record<
    string,
    Array<{
      name: string;
      uniqProperties: string[];
    }>
  >;
};

// currently don't care about "head" and "options"
export type HttpMethod = "delete" | "get" | "patch" | "post" | "put";

export type OpenAPIV3Algebraic =
  & OpenAPIV3.NonArraySchemaObject
  & (
    | Required<Pick<OpenAPIV3.NonArraySchemaObject, `allOf`>>
    | Required<Pick<OpenAPIV3.NonArraySchemaObject, `anyOf`>>
    | Required<Pick<OpenAPIV3.NonArraySchemaObject, `oneOf`>>
  );

export type OpenAPIV3Enum =
  & OpenAPIV3.NonArraySchemaObject
  & Required<Pick<OpenAPIV3.NonArraySchemaObject, `enum`>>;

export type OpenAPIV3Object = OpenAPIV3.NonArraySchemaObject & {
  type: `object`;
} & Required<Pick<OpenAPIV3.NonArraySchemaObject, `properties`>>;

export type OpenAPIV3Scalar = OpenAPIV3.NonArraySchemaObject & {
  type: `boolean` | `integer` | `number` | `string`;
};