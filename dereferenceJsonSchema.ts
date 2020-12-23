// inspired by https://github.com/cvent/json-schema-deref-sync

import { JsonPointer } from "https://cdn.skypack.dev/json-ptr";
import jsonSchemaTraverse from "https://cdn.skypack.dev/json-schema-traverse";

type Schema = Record<string, unknown>;
type SchemaObject = Record<string, unknown>;
// @see https://github.com/epoberezkin/json-schema-traverse#readme
type JsonSchemaTraverseCallback = (
  current: SchemaObject,
  currentRef: string,
  root: Schema,
  parentRef: string,
  parentKey: string,
  parent: Record<string, Schema>,
  key: number | string,
) => void;

export const isReferenceSchemaObject = (
  schemaObject: SchemaObject,
): schemaObject is { $ref: string } => typeof schemaObject.$ref === "string";

// Could be extended to handle non-local JSON pointers
export const resolveRef: (
  rootSchema: Schema,
  ref: string,
) => Schema | undefined = JsonPointer.get;

const dereference: JsonSchemaTraverseCallback = (
  current,
  _currentRef,
  root,
  _parentRef,
  parentKey,
  parent,
  key,
) => {
  if (isReferenceSchemaObject(current)) {
    const dereferenced = resolveRef(root, current.$ref);
    if (!dereferenced) {
      throw new Error(
        `Failed to dereference JSON pointer: "${current.$ref}"`,
      );
    }
    if (key !== undefined) {
      parent[parentKey][key] = dereferenced;
    } else {
      parent[parentKey] = dereferenced;
    }
  }
};

/**
 * Adapt json-schema-traverse for traversing OpenAPI.
 * NOTE: you must also pass `allKeys: true` to options.
 */
(function adaptTraverseToOpenAPI() {
  const { default: _default, ...skipKeywords } =
    jsonSchemaTraverse.skipKeywords;
  jsonSchemaTraverse.skipKeywords = skipKeywords;
})();

export const dereferenceSchema = (
  schema: Schema,
): Schema => {
  // mutates in-place, if not inteded, clone
  jsonSchemaTraverse(
    schema,
    {
      allKeys: true,
      cb: dereference,
    },
  );
  return schema;
};
