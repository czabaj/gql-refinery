import { G, R } from "./deps.ts";
import { stringify } from "./stringify.ts";

const mergeDescriptions = (
  descriptions: Array<string | null | undefined>,
): string | undefined =>
  R.uniq(descriptions.filter(Boolean)).join(`. `) || undefined;

type GQLObjectType = G.GraphQLObjectType | G.GraphQLInputObjectType;
const isGQLObject = (
  obj: G.GraphQLType,
): obj is GQLObjectType => G.isInputObjectType(obj) || G.isObjectType(obj);

const mergeFieldType = (
  a: G.GraphQLType,
  b: G.GraphQLType,
): G.GraphQLType | never => {
  if (R.equals(a, b)) {
    return a;
  }
  const fields = [a, b];
  if (fields.some(G.isNonNullType)) {
    const nonRequired = fields.map((f) =>
      // deno-lint-ignore no-explicit-any
      G.isNonNullType(f) ? (f as any).ofType : f
    ) as [G.GraphQLType, G.GraphQLType];
    const merged = mergeFieldType(...nonRequired);
    // if at least one is non-required, the result is non-required
    return fields.every(G.isNonNullType) ? G.GraphQLNonNull(merged) : merged;
  }
  if (fields.some(G.isListType)) {
    if (!fields.every(G.isListType)) {
      throw new Error([
        `Atempt to merge fields which are not compatible.`,
        `A: ${stringify(a, { maxDepth: 1 })}`,
        `B: ${stringify(b, { maxDepth: 1 })}`,
        `Cannot merge list and non-list.`,
      ].join(`\n`));
    }
    // deno-lint-ignore no-explicit-any
    return G.GraphQLList(mergeFieldType((a as any).ofType, (b as any).ofType));
  }
  if (fields.some(isGQLObject)) {
    return mergeObjects(fields);
  }
  // TODO: handle union types
  if (!fields.every(G.isLeafType)) {
    throw new Error([
      `Expected type to be LeafType (Scalar or Enum) but got.`,
      `A: ${stringify(a, { maxDepth: 1 })}`,
      `B: ${stringify(b, { maxDepth: 1 })}`,
    ].join(`\n`));
  }
  // coerce all non-matching scalars and enums to string
  return G.GraphQLString;
};

type GQLFieldConfig =
  // deno-lint-ignore no-explicit-any
  | G.GraphQLFieldConfig<any, any>
  | G.GraphQLInputFieldConfig;
const mergeFields = (a: GQLFieldConfig, b: GQLFieldConfig): GQLFieldConfig => ({
  description: mergeDescriptions([a.description, b.description]),
  // deno-lint-ignore no-explicit-any
  type: mergeFieldType(a.type, b.type) as any,
});

// deno-lint-ignore no-explicit-any
type GQLFieldMap = G.GraphQLFieldMap<any, any> | G.GraphQLInputFieldMap;
type GQLFieldMapTuple = [GQLFieldMap, GQLFieldMap];
const mergeFieldsMap = (
  fieldsMap: [GQLFieldMap, ...GQLFieldMap[]],
): GQLFieldMap => {
  switch (fieldsMap.length) {
    case 1:
      return fieldsMap[0];
    case 2:
      return R.mergeWith(mergeFields, ...fieldsMap as GQLFieldMapTuple);
    default:
      return mergeFieldsMap(R.splitAt(2, fieldsMap).map(mergeFieldsMap));
  }
};

export const mergeObjects = <
  Input extends G.GraphQLType[],
>(
  objects: Input,
  name?: string,
): Input extends G.GraphQLObjectType[] ? G.GraphQLObjectType
  : Input extends G.GraphQLInputObjectType[] ? G.GraphQLInputObjectType
  : never => {
  if (objects.length === 0) {
    throw new Error(`mergeObjects require at least one object in input array`);
  }
  if (!objects.every(isGQLObject)) {
    throw new Error([
      `Currently only _objects_ (i.e. non-scalar and non-list) could be merged\n`,
      stringify(objects, { maxDepth: 1 }),
    ].join(``));
  }
  const verifiedObjects = objects as GQLObjectType[];
  if (verifiedObjects.length === 1) {
    console.warn(
      `Merging of single object just returns the only object meged.`,
      `Only single schema composition indicates some error in your specification file.`,
    );
    // deno-lint-ignore no-explicit-any
    return verifiedObjects[0] as any;
  }
  const fields = mergeFieldsMap(
    verifiedObjects.map((o) => o.toConfig().fields) as [
      GQLFieldMap,
      GQLFieldMap,
      ...GQLFieldMap[],
    ],
  );
  const Clazz = Object.getPrototypeOf(verifiedObjects[0]).constructor;
  return new Clazz({
    description: mergeDescriptions(
      verifiedObjects.map((obj) => obj.description),
    ),
    fields,
    name: name || verifiedObjects.map((obj) => obj.name).join(`_`),
  });
};
