import { JsonPointer, OpenAPIV3, R } from "./deps.ts";
import {
  ExtraArgs,
  OpenAPIV3Algebraic,
  OpenAPIV3Enum,
  OpenAPIV3Object,
  OpenAPIV3Scalar,
} from "./types.d.ts";
import { stringify } from "./stringify.ts";

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

export const dereferenceAndDistill = <
  OASType,
  Distilled,
>(
  boundDereference: ReturnType<typeof dereference>,
  // deno-lint-ignore no-explicit-any
  distiller: (input: OASType, ...other: any[]) => Distilled,
): (
  input: OASType | OpenAPIV3.ReferenceObject,
  ...other: ExtraArgs<typeof distiller>
) => Distilled => {
  // deno-lint-ignore no-explicit-any
  const updateTitle = (R as any).over(R.lensProp(`title`));
  const lastJsonPointerPathSegment = (ref: string) =>
    R.last(JsonPointer.decode(ref));
  // resolves reference and pass dereferenced object to distiller
  const referenceDistiller = (
    ref: string,
    input: OASType,
    other: ExtraArgs<typeof distiller>,
  ) =>
    distiller(
      updateTitle(
        (title?: string) => title || lastJsonPointerPathSegment(ref),
        input,
      ),
      ...other,
    );
  // results of reference distillation is memoized by reference path
  const memoizedReferenceDistiller = R.memoizeWith(
    R.identity,
    referenceDistiller,
  );
  return (input, ...other) => {
    const [dereferenced, ref] = boundDereference<OASType>(input);
    return ref
      ? memoizedReferenceDistiller(ref, dereferenced, other)
      : distiller(dereferenced, ...other);
  };
};

type PropertyData = {
  required: boolean;
  schema: OpenAPIV3.SchemaObject;
};
export const mergeObjects = (
  objects: OpenAPIV3Object[],
): OpenAPIV3Object => {
  if (objects.length === 1) {
    return objects[0];
  }
  const propertyDataByName = objects.flatMap(({ properties, required }) =>
    Object.entries(properties).map(([name, schema]) =>
      [name, { required: Boolean(required?.includes(name)), schema }] as [
        string,
        PropertyData,
      ]
    )
  ).reduce(
    (acc, [name, property]) => {
      const duplicate = acc[name];
      if (!duplicate) {
        acc[name] = property;
        return acc;
      }
      if (duplicate.schema.type !== property.schema.type) {
        const schemes = [duplicate.schema, property.schema];
        const types = [duplicate.schema.type, property.schema.type];
        if (schemes.every(isScalar)) {
          if (types.includes(`integer`) && types.includes(`number`)) {
            duplicate.schema.type = `number`;
          } else {
            duplicate.schema.type = `string`;
          }
        } else {
          throw new Error(
            `Cannot merge objects with same properties of different type.
            Conflicting property name "${name}":
  
            A: ${stringify(duplicate.schema, { maxDepth: 1 })}
  
            B: ${stringify(property.schema, { maxDepth: 1 })}
            `,
          );
        }
      }
      if (duplicate.required && !property.required) {
        duplicate.required = false;
      }
      return acc;
    },
    {} as Record<string, PropertyData>,
  );
  return Object.entries(propertyDataByName).reduce(
    (acc, [name, propertyData]) => {
      acc.properties[name] = propertyData.schema;
      if (propertyData.required) {
        acc.required!.push(name);
      }
      return acc;
    },
    {
      properties: {},
      required: [],
      type: `object`,
    } as OpenAPIV3Object,
  );
};
