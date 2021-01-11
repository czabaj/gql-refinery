import { JsonPointer, OpenAPIV3, R } from "./deps.ts";
import {
  OpenAPIV3Algebraic,
  OpenAPIV3Enum,
  OpenAPIV3Object,
  OpenAPIV3Scalar,
} from "./types.d.ts";

/**
 * GraphQL does not support empty object, every object type must have at least one property.
 * This declaration with boolean `_` attribute thus represents virtually empty object.
 */
export const emptySchemaObject: OpenAPIV3.SchemaObject = {
  type: "object",
  properties: { _: { type: "boolean" } },
};

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

export const isOpenAPIV3Document = (
  // deno-lint-ignore no-explicit-any
  fileContent: any,
): fileContent is OpenAPIV3.Document => fileContent?.openapi?.startsWith?.(`3`);

export const isAlgebraic = (
  schema: OpenAPIV3.SchemaObject,
): schema is OpenAPIV3Algebraic =>
  Boolean(schema.allOf || schema.anyOf || schema.oneOf);

export const isEnum = (
  schema: OpenAPIV3.SchemaObject,
): schema is OpenAPIV3Enum => Boolean(schema.enum);

export const isList = (
  schema: OpenAPIV3.SchemaObject,
): schema is OpenAPIV3.ArraySchemaObject => schema.type === `array`;

export const isNonArray = (
  obj: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
): obj is OpenAPIV3.NonArraySchemaObject =>
  !(`$ref` in obj) && obj.type !== `array`;

export const isObject = (
  schema: OpenAPIV3.SchemaObject,
): schema is OpenAPIV3Object => schema.type === `object`;

export const isReference = (
  schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
): schema is OpenAPIV3.ReferenceObject => `$ref` in schema;

export const isScalar = (
  schema: OpenAPIV3.SchemaObject,
): schema is OpenAPIV3Scalar => {
  const { type } = schema;
  return type === `boolean` || type === `integer` || type === `number` ||
    type === `string`;
};

export const lastJsonPointerPathSegment = (ref: string): string =>
  R.last(JsonPointer.decode(ref));

export const resolveRef = <Dereferenced>(
  document: OpenAPIV3.Document,
  $ref: string,
): Dereferenced => {
  // Could be extended to handle non-local JSON pointers
  const dereferenced = JsonPointer.get(document, $ref);
  if (!dereferenced) {
    throw new Error(
      `Failed to dereference JSON pointer: "${$ref}"`,
    );
  }
  return dereferenced;
};

export const dereference = (document: OpenAPIV3.Document) => {
  const dereferenceImpl = <OASType>(
    input: OASType | OpenAPIV3.ReferenceObject,
    ref?: string,
  ): [OASType, string] | [OASType] =>
    isReference(input)
      ? dereferenceImpl(resolveRef<OASType>(document, input.$ref), input.$ref)
      : ref
      ? [input, ref]
      : [input];
  return R.unary(dereferenceImpl) as <OASType>(
    input: OASType | OpenAPIV3.ReferenceObject,
  ) => [OASType, string] | [OASType];
};

type ExtraArgs<
  // deno-lint-ignore no-explicit-any
  Fn extends (first: any, second: any, ...extra: any[]) => any,
> =
  // deno-lint-ignore no-explicit-any
  Parameters<Fn> extends [any, any, ...(infer Extra)] ? Extra : never;
export const dereferenceAndDistill = <
  OASType,
  Distilled,
>(
  boundDereference: ReturnType<typeof dereference>,
  distiller: (
    ref: string | undefined,
    input: OASType,
    // deno-lint-ignore no-explicit-any
    ...other: any[]
  ) => Distilled,
): (
  input: OASType | OpenAPIV3.ReferenceObject,
  ...other: ExtraArgs<typeof distiller>
) => Distilled => {
  // resolves reference and pass dereferenced object to distiller
  const referenceDistiller = (
    ref: string,
    input: OASType,
    other: ExtraArgs<typeof distiller>,
  ) => distiller(ref, input, ...other);
  // results of reference distillation is memoized by reference path
  const memoizedReferenceDistiller = R.memoizeWith(
    R.identity,
    referenceDistiller,
  );
  return (input, ...other) => {
    const [dereferenced, ref] = boundDereference<OASType>(input);
    return ref
      ? memoizedReferenceDistiller(ref, dereferenced, other)
      : distiller(undefined, dereferenced, ...other);
  };
};
