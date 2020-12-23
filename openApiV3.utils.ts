import { G, JsonPointer, OpenAPIV3, R } from "./deps.ts";
import { Distiller } from "./types.d.ts";
import { isSuccessStatusCode } from "./utils.ts";

/**
 * GraphQL does not support empty object, every object type must have at least one property.
 * This declaration with boolean `_` attribute thus represents virtually empty object.
 */
export const emptySchemaObject: OpenAPIV3.SchemaObject = {
  type: "object",
  properties: { _: { type: "boolean" } },
};

export const getGraphQLTypeName = (
  outputType: G.GraphQLOutputType,
): string | undefined =>
  G.isObjectType(outputType)
    ? outputType.name
    : G.isListType(outputType)
    ? getGraphQLTypeName(outputType.ofType)
    : undefined;

const mediaJSON = /application\/json/i;
export const graphqlCompliantMediaType = (
  obj: OpenAPIV3.RequestBodyObject | OpenAPIV3.ResponseObject,
): OpenAPIV3.ArraySchemaObject | OpenAPIV3.SchemaObject => {
  if (!obj.content) {
    // Empty response
    return { type: "boolean" };
  }
  const jsonResponse = Object.entries(obj.content).find(([mediaType]) =>
    mediaJSON.test(mediaType)
  );
  if (!jsonResponse) {
    // response exists but is not JSON
    return { type: "string" };
  }

  const jsonResponseSchema = jsonResponse[1].schema as OpenAPIV3.SchemaObject;
  return !jsonResponseSchema ||
      (jsonResponseSchema.type === "object" &&
        R.isEmpty(jsonResponseSchema.properties))
    ? emptySchemaObject
    : jsonResponseSchema;
};

export const isAlgebraic = (
  schema: OpenAPIV3.SchemaObject,
): schema is OpenAPIV3.NonArraySchemaObject =>
  Boolean(schema.allOf || schema.anyOf || schema.oneOf);

export const isEnum = (
  schema: OpenAPIV3.SchemaObject,
): schema is OpenAPIV3.NonArraySchemaObject => Boolean(schema.enum);

export const isList = (
  schema: OpenAPIV3.SchemaObject,
): schema is OpenAPIV3.ArraySchemaObject => schema.type === `array`;

export const isNonArray = (
  obj: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
): obj is OpenAPIV3.NonArraySchemaObject =>
  !(`$ref` in obj) && obj.type !== `array`;

export const isObject = (
  schema: OpenAPIV3.SchemaObject,
): schema is OpenAPIV3.NonArraySchemaObject => schema.type === `object`;

export const isReference = (
  schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
): schema is OpenAPIV3.ReferenceObject => `$ref` in schema;

export const isScalar = (
  schema: OpenAPIV3.SchemaObject,
): schema is OpenAPIV3.NonArraySchemaObject => {
  const { type } = schema;
  return type === `boolean` || type === `integer` || type === `number` ||
    type === `string`;
};

// Could be extended to handle non-local JSON pointers
export const resolveRef: <OASType extends OpenAPIV3.SchemaObject>(
  rootSchema: OpenAPIV3.Document,
  ref: string,
) => OASType | undefined = JsonPointer.get;

export const withDereferenceMemoized = <
  OASInput,
  GQLOutput,
>(
  document: OpenAPIV3.Document,
  distiller: Distiller<OASInput, GQLOutput>,
): Distiller<
  OASInput | OpenAPIV3.ReferenceObject,
  GQLOutput
> => {
  // resolves reference and pass dereferenced object to distiller
  const referenceDistiller = (ref: string) => {
    const dereferenced = resolveRef<
      Exclude<OASInput, OpenAPIV3.ReferenceObject>
    >(document, ref);
    if (!dereferenced) {
      throw new Error(
        `Failed to dereference JSON pointer: "${ref}"`,
      );
    }
    const refPathSegments = JsonPointer.decode(ref);
    return (distiller(dereferenced, R.last(refPathSegments)));
  };
  // results of reference distillation is memoized by reference path
  const memoizedReferenceDistiller = R.memoizeWith(
    R.identity,
    referenceDistiller,
  );
  return (input, parentName) =>
    isReference(input)
      ? memoizedReferenceDistiller(input.$ref)
      : distiller(input, parentName);
};
