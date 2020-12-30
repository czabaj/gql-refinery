import { G, OpenAPIV3, R } from "./deps.ts";
import {
  dereference,
  dereferenceAndDistill,
  emptySchemaObject,
  graphqlCompliantMediaType,
  isAlgebraic,
  isEnum,
  isList,
  isObject,
  isReference,
  isScalar,
  mergeObjects,
} from "./openApiV3.utils.ts";
import { stringify } from "./log.ts";
import {
  BODY_ARG,
  DistilledOperationParameter,
  HttpMethod,
  OpenAPIV3Algebraic,
  OpenAPIV3Enum,
  OpenAPIV3Object,
  OpenAPIV3Scalar,
} from "./types.d.ts";
import {
  httpMethods,
  isSuccessStatusCode,
  isValidGraphQLName,
} from "./utils.ts";

export type DistillationHooks = {
  onEnumDistilled?(
    name: string,
    source: OpenAPIV3Enum,
  ): void;
  onOperationDistilled?(
    path: string,
    httpMethod: HttpMethod,
    operationId: string,
    // deno-lint-ignore no-explicit-any
    fieldConfig: G.GraphQLFieldConfig<any, any, any>,
  ): void;
};

export type Context = {
  boundDereference: ReturnType<typeof dereference>;
  hooks: DistillationHooks;
  interfaces: Map<string, G.GraphQLInterfaceType>;
  interfaceRelations: Map<string, string[]>;
};

const distillScalar = (schema: OpenAPIV3Scalar): G.GraphQLScalarType => {
  switch (schema.type) {
    case `boolean`:
      return G.GraphQLBoolean;
    case `integer`:
      return G.GraphQLInt;
    case `number`:
      return G.GraphQLFloat;
    case `string`:
      return G.GraphQLString;
  }
};

const extractAlgebraicComponents = (
  boundDereference: ReturnType<typeof dereference>,
  schema: OpenAPIV3Algebraic,
): OpenAPIV3Object[] =>
  (schema.allOf || schema.anyOf || schema.oneOf)!.flatMap(
    (component) => {
      const dereferenced =
        // deno-lint-ignore no-explicit-any
        boundDereference<OpenAPIV3Object | OpenAPIV3Algebraic>(component as any)[0];
      if (isAlgebraic(dereferenced)) {
        return extractAlgebraicComponents(boundDereference, dereferenced);
      }
      if (!isObject(dereferenced)) {
        throw new Error([
          `Currently only object schemas could be combined with "allOf", "anyOf" or "oneOf" composition\n`,
          stringify(schema, { maxDepth: 3 }),
          `\n\nFollowing schema violates this rule`,
          stringify(dereferenced, { maxDepth: 1 }),
        ].join(``));
      }
      return dereferenced;
    },
  );

const distillInputType = (
  context: Context,
) => {
  const { boundDereference, hooks: { onEnumDistilled } } = context;
  const boundDistillInputType: (
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    parentName: string,
  ) => G.GraphQLInputType = dereferenceAndDistill<
    OpenAPIV3.SchemaObject,
    G.GraphQLInputType
  >(
    boundDereference,
    (schema: OpenAPIV3.SchemaObject, parentName: string) => {
      if (isAlgebraic(schema)) {
        const components = extractAlgebraicComponents(
          boundDereference,
          schema,
        );
        const name = schema.title || parentName;
        return boundDistillInputType(mergeObjects(components), name);
      }
      if (isEnum(schema)) {
        onEnumDistilled?.(schema.title || parentName, schema);
        return G.GraphQLString;
      }
      if (isList(schema)) {
        return new G.GraphQLList(
          boundDistillInputType(schema.items, parentName),
        );
      }
      if (isObject(schema)) {
        const name = `${schema.title || parentName}Input`;
        const { required } = schema;
        return new G.GraphQLInputObjectType({
          description: schema.description,
          fields: R.mapObjIndexed(
            (
              prop: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
              key: string,
            ) => {
              const type = boundDistillInputType(prop, `${name}_${key}`);
              return required?.includes(key) ? G.GraphQLNonNull(type) : type;
            },
            schema.properties,
          ),
          name,
        });
      }
      if (isScalar(schema)) {
        return distillScalar(schema);
      }
      throw new Error(`Unsupported schema in "distillInputType" function:
      ${stringify(schema, { maxDepth: 1 })}`);
    },
  );
  return boundDistillInputType;
};

const distillOutputType = (
  context: Context,
) => {
  const { boundDereference, interfaceRelations, interfaces } = context;
  const addInterfaceRelation = (extendsName: string, ifaceName: string) => {
    let relation = interfaceRelations.get(extendsName);
    if (!relation) {
      relation = [];
      interfaceRelations.set(extendsName, relation);
    }
    relation.push(ifaceName);
  };
  const getIface = (source: G.GraphQLObjectType): G.GraphQLInterfaceType => {
    const ifaceName = `${source.name}Interface`;
    let iface = interfaces.get(ifaceName);
    if (!iface) {
      iface = new G.GraphQLInterfaceType({
        name: ifaceName,
        fields: source.toConfig().fields,
      });
      interfaces.set(ifaceName, iface);
      // self extends
      addInterfaceRelation(source.name, iface.name);
    }
    return iface;
  };
  const addNewInterface = (
    ifaceSourceObj: G.GraphQLObjectType,
    extendsObj: G.GraphQLObjectType,
  ) => {
    const iface = getIface(ifaceSourceObj);
    addInterfaceRelation(extendsObj.name, iface.name);
  };

  const boundDistillOutputType: (
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    parentName: string,
  ) => G.GraphQLOutputType = dereferenceAndDistill<
    OpenAPIV3.SchemaObject,
    G.GraphQLOutputType
  >(
    boundDereference,
    (schema, parentName) => {
      if (isAlgebraic(schema)) {
        const components = extractAlgebraicComponents(
          boundDereference,
          schema,
        );
        const name = schema.title || parentName;
        const union = !schema.allOf;
        if (union) {
          return new G.GraphQLUnionType({
            description: schema.description,
            name,
            types: components.map((component, idx) =>
              boundDistillOutputType(component, `${name}_${idx}`)
            ) as G.GraphQLObjectType[],
          });
        }
        const intersection = boundDistillOutputType(
          mergeObjects(components),
          name,
        ) as G.GraphQLObjectType;
        (schema.allOf || schema.anyOf)!.forEach(
          (component) => {
            if (isReference(component)) {
              const componentObject = boundDistillOutputType(
                component,
                ``,
              ) as G.GraphQLObjectType;
              addNewInterface(componentObject, intersection);
            }
          },
        );
        return intersection;
      }
      if (isEnum(schema)) {
        return G.GraphQLString;
      }
      if (isList(schema)) {
        return new G.GraphQLList(
          boundDistillOutputType(schema.items, parentName),
        );
      }
      if (isObject(schema)) {
        const name = schema.title || parentName;
        const { required } = schema;
        return new G.GraphQLObjectType({
          description: schema.description,
          interfaces() {
            return interfaceRelations.get(name)?.map(
              Map.prototype.get,
              interfaces,
            );
          },
          fields: R.mapObjIndexed(
            (
              prop: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
              key: string,
            ) => {
              let type = boundDistillOutputType(prop, `${name}_${key}`);
              if (key === `id` && G.isScalarType(type)) {
                type = G.GraphQLID;
              }
              return required?.includes(key) ? G.GraphQLNonNull(type) : type;
            },
            schema.properties,
          ),
          name,
        });
      }
      if (isScalar(schema)) {
        return distillScalar(schema);
      }
      throw new Error(`Unsupported schema in "distillOutputType" function:
      ${stringify(schema, { maxDepth: 1 })}`);
    },
  );
  return boundDistillOutputType;
};

const BODY: BODY_ARG = `body`;
const distillArguments = (
  context: Context,
  boundDistillInputType: ReturnType<typeof distillInputType>,
) => {
  const { boundDereference } = context;
  const boundDistillParameter = dereferenceAndDistill<
    OpenAPIV3.ParameterObject,
    DistilledOperationParameter
  >(boundDereference, (parameter, parentName) => {
    const { name } = parameter;
    if (name === BODY) {
      throw new Error(
        `Invalid parameter ${stringify(parameter, { maxDepth: 1 })},
        \nOperation parameter MUST NOT have reserved name "${BODY}".`,
      );
    }

    return {
      description: parameter.description,
      in: parameter.in as `cookie` | `header` | `path` | `query`,
      name,
      required: Boolean(parameter.required),
      type: boundDistillInputType(
        parameter.schema as OpenAPIV3.SchemaObject,
        `${parentName}_${name}`,
      ),
    } as DistilledOperationParameter;
  });

  return (
    operationId: string,
    requestBody?: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject,
    parameters?: Array<OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject>,
  ): DistilledOperationParameter[] | undefined => {
    const dereferencedBody = requestBody &&
      (boundDereference<OpenAPIV3.RequestBodyObject>(requestBody)[0]);
    return !dereferencedBody && R.isEmpty(parameters) ? undefined : ([
      dereferencedBody &&
      ({
        description: dereferencedBody.description,
        in: BODY,
        name: BODY,
        required: Boolean(dereferencedBody.required),
        type: boundDistillInputType(
          graphqlCompliantMediaType(dereferencedBody),
          `${operationId}_${BODY}`,
        ),
      } as DistilledOperationParameter),
    ]
      .concat(
        parameters &&
          (parameters).map((parameter) =>
            boundDistillParameter(parameter, operationId)
          ),
      )
      .filter(Boolean) as DistilledOperationParameter[]);
  };
};

export const distillOperation = (
  context: Context,
  boundDistillArguments: ReturnType<typeof distillArguments>,
  boundDistillOutputType: ReturnType<typeof distillOutputType>,
) => {
  const { boundDereference, hooks: { onOperationDistilled } } = context;
  return (
    path: string,
    httpMethod: HttpMethod,
    operation: OpenAPIV3.OperationObject,
  ): {
    // deno-lint-ignore no-explicit-any
    fieldConfig: G.GraphQLFieldConfig<any, any, any>;
    fieldName: string;
  } => {
    const { operationId, responses } = operation;
    if (!operationId) {
      throw new Error(`OpenApi operation MUST contain "operationId".
      ${
        stringify(operation, { maxDepth: 1 })
      }\n\nAbove operation miss "operationId" property.`);
    }
    if (!isValidGraphQLName(operationId)) {
      throw new Error(`OpenApi operationId MUST be a valid GraphQL name.
      ${
        stringify(operation, { maxDepth: 1 })
      }\n\nAbove operation has invalid "operationId".`);
    }
    const groupedResponses = responses &&
      Object.entries(responses).reduce(
        (acc, [httpStatusCode, operation]) => {
          const key = isSuccessStatusCode(httpStatusCode) ? `success` : `error`;
          acc[key] = (acc[key] || []).concat(operation);
          return acc;
        },
        {} as {
          error?: Array<OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject>;
          success?: Array<OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject>;
        },
      );
    if (R.isEmpty(groupedResponses?.success)) {
      throw new Error(`OpenApi operation MUST contain success response.
      ${
        stringify(operation, { maxDepth: 1 })
      }\n\nAbove operation does not contain definition of success response.`);
    }
    if (groupedResponses!.success!.length > 1) {
      throw new Error(`Currently only single success response is supported.
      ${
        stringify(operation, { maxDepth: 1 })
      }\n\nAbove operation contains more than one success response definition, which currently is not supported.`);
    }
    // we generally do not need process error resposnes, but it might be necessary to call
    // DistillationHooks on all objects in error responses
    groupedResponses!.error?.forEach((response) => {
      boundDistillOutputType(
        graphqlCompliantMediaType(
          boundDereference<OpenAPIV3.ResponseObject>(response)[0],
        ),
        operationId,
      );
    });
    const distilledArguments = boundDistillArguments(
      operationId,
      operation.requestBody,
      operation.parameters,
    );
    const successResponse = groupedResponses!.success![0];
    // deno-lint-ignore no-explicit-any
    const fieldConfig: G.GraphQLFieldConfig<any, any, any> = {
      args: distilledArguments &&
        distilledArguments.reduce((acc, { description, name, type }) => {
          acc[name] = { description, type };
          return acc;
        }, {} as G.GraphQLFieldConfigArgumentMap),
      description: [operation.summary, operation.description].filter(Boolean)
        .join(`\n\n`),
      extensions: { distilledArguments },
      type: boundDistillOutputType(
        graphqlCompliantMediaType(
          boundDereference<OpenAPIV3.ResponseObject>(successResponse)[0],
        ),
        operationId,
      ),
    };

    onOperationDistilled?.(path, httpMethod, operationId, fieldConfig);
    return {
      fieldConfig,
      fieldName: operationId,
    };
  };
};

export const toGraphQL = (
  document: OpenAPIV3.Document,
  hooks: DistillationHooks = {},
) => {
  const context: Context = {
    boundDereference: dereference(document),
    hooks,
    interfaceRelations: new Map(),
    interfaces: new Map(),
  };

  const boundDistillInputType = distillInputType(
    context,
  );
  const boundDistillOutputType = distillOutputType(
    context,
  );
  const boundDistillArguments = distillArguments(
    context,
    boundDistillInputType,
  );
  const boundDistillOperation = distillOperation(
    context,
    boundDistillArguments,
    boundDistillOutputType,
  );
  const { Mutation, Query } = Object.entries(document.paths).reduce(
    ((acc, [urlPath, pathItemObject]) => {
      httpMethods.forEach((httpMethod) => {
        if (httpMethod in pathItemObject) {
          const { fieldConfig, fieldName } = boundDistillOperation(
            urlPath,
            httpMethod,
            pathItemObject[httpMethod] as OpenAPIV3.OperationObject,
          );
          acc[httpMethod === `get` ? `Query` : `Mutation`][fieldName] =
            fieldConfig;
        }
      });
      return acc;
    }),
    { Mutation: {}, Query: {} } as {
      Mutation: Record<string, G.GraphQLFieldConfig<unknown, unknown>>;
      Query: Record<string, G.GraphQLFieldConfig<unknown, unknown>>;
    },
  );

  return new G.GraphQLSchema({
    query: R.isEmpty(Query)
      ? boundDistillOutputType(
        emptySchemaObject,
        `Query`,
      ) as G.GraphQLObjectType
      : new G.GraphQLObjectType({
        name: `Query`,
        fields: Query,
      }),
    mutation: R.isEmpty(Mutation) ? null : new G.GraphQLObjectType({
      name: `Mutation`,
      fields: Mutation,
    }),
  });
};
