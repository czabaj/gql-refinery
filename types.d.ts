import { G, OpenAPIV3 } from "./deps.ts";
export type AnyObject = Record<string, unknown>;

type ParentObjectName = string;
type FieldName = string;
type ChildObjectName = string;
type GraphQLInvalidFieldName = string;

export type Enums = Map<string, string[]>;

export type PossibleType = {
  name: string;
  uniqProperties: string[];
};

export type ApiArtifacts = {
  objectsRelation: Record<ParentObjectName, Record<FieldName, ChildObjectName>>;
  objectsRename: Record<
    ParentObjectName,
    Record<GraphQLInvalidFieldName, FieldName>
  >;
  operations: Array<{
    httpMethod: HttpMethod;
    operationId: string;
    path: string;
    responseType?: string;
  }>;
  possibleTypes: Record<
    string,
    Array<PossibleType>
  >;
};

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

export type GQLFieldConfig =
  // deno-lint-ignore no-explicit-any
  | G.GraphQLFieldConfig<any, any>
  | G.GraphQLInputFieldConfig;

// deno-lint-ignore no-explicit-any
export type GQLFieldMap = G.GraphQLFieldMap<any, any> | G.GraphQLInputFieldMap;

export type GQLObject =
  // deno-lint-ignore no-explicit-any
  | G.GraphQLObjectType<any, any>
  | G.GraphQLInputObjectType;

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
