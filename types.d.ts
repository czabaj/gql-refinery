import { OpenAPIV3 } from "./deps.ts";
export type AnyObject = Record<string, unknown>;

export type DistilledAlgebraic = DistilledNamedType & {
  kind: "intersection" | "union";
  components: DistilledType[];
};

export type DistilledArray = {
  kind: "array";
  items: DistilledType;
};

export type DistilledEnum = DistilledNamedType & {
  kind: "enum";
  values: string[];
};

export type DistilledNamedType = {
  /**
	 * Declaration name of type  or name synthesized from parents. Name is required for GQL is object
	 * relation model. We assign synthetic name from parents if name is not found on declaration.
	 * Usage of synthetic name is indicated by `syntheticName` flag.
	 */
  name: string;
  /**
	 * In case the source name is not compatible with GraphQL naming convention, we convert the name
	 * into camelCase and the original name is stored as `originalName. This is done in distillation
	 * phase for all later phases of transformation must use the valid name. The `originalName` cannot
	 * be used in GQL schema nor TS types, the originalName will be only used for communication with
	 * server and all parts behind client GQL engine uses converted name.
	 */
  originalName?: string;
  /**
	 * Indicates name synthesized from parents
	 */
  syntheticName?: boolean;
};

export type DistilledObject = DistilledNamedType & {
  kind: "object";
  properties: DistilledProperty[];
};

export type DistilledOperation = {
  httpMethod: HttpMethod;
  operationId: string;
  parameters?: DistilledOperationParameter[];
  /**
   * Path must contain path parameters in _colon convention_ as used in Node.js express server or
   * in client side routing libraries.
   *
   * Example:
   * 	BAD:	/api/gate/{applicationSlug}/login
   * 	GOOD:	/api/gate/:applicationSlug/login
   *
   */
  path: string;
  returnType: DistilledAlgebraic | DistilledArray | DistilledObject;
  /**
   * JsonSchema of response to allow client side validation during development.
   */
  schemaResponse: OpenAPIV3.SchemaObject;
};

export type DistilledOperationParameter = DistilledProperty & {
  in: "body" | "header" | "path" | "query";
  /**
   * Response body uses reserved name `body`
   */
  name: "body" | string;
  /**
   * JsonSchema of parameter to allow client side validation during development.
   */
  schema: OpenAPIV3.SchemaObject;
};

export type DistilledProperty = DistilledNamedType & {
  required: boolean;
  type: DistilledType;
};

export type DistilledScalar = {
  kind: "scalar";
  name: "boolean" | "integer" | "number" | "string";
};

export type DistilledType =
  | DistilledAlgebraic
  | DistilledArray
  | DistilledEnum
  | DistilledObject
  | DistilledScalar;

export type ApiArtifacts = {
  enums: Record<string, string[]>;
  objectsRelation: Record<string, Record<string, string>>;
  operations: Array<{
    httpMethod: HttpMethod;
    responseType?: string;
    operationId: string;
    path: string;
  }>;
  possibleTypes: Record<
    string,
    Array<{
      name: string;
      uniqProperties: string[];
    }>
  >;
}

// currently don't care about "head" and "options"
export type HttpMethod = "delete" | "get" | "patch" | "post" | "put";

export type Distiller<
  OASInput,
  GQLOutput,
> = (input: OASInput, parentName: string) => GQLOutput;
