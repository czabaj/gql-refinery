import { G, OpenAPIV3, R } from "../../deps.ts";
import {
  InterfaceExtension,
  interfaceExtensionFactory,
} from "../graphql/interfaceExtension.ts";
import { mergeObjects } from "../graphql/mergeObjects.ts";
import {
  isValidGraphQLName,
  toValidGraphQLName,
} from "../graphql/validName.ts";
import { stringify } from "../log.ts";
import {
  BodyArg,
  DistilledOperationParameter,
  HttpMethod,
  OpenAPIV3Enum,
} from "../types.d.ts";
import {
  createOneOf,
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
  isSuccessStatusCode,
  lastJsonPointerPathSegment,
} from "./utils.ts";

export const httpMethods: HttpMethod[] = [
  `delete`,
  `get`,
  `patch`,
  `post`,
  `put`,
];

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
    distilledArguments?: DistilledOperationParameter[],
  ): void;
  onPropertyRenamed?(
    objectName: string,
    originalName: string,
    changedName: string,
  ): void;
};

export type Context = {
  boundDereference: ReturnType<typeof dereference>;
  hooks: DistillationHooks;
  interfaceExtension: InterfaceExtension;
};

const distillName = (
  title: string | undefined,
  ref: string | undefined,
  parentName: string,
): string =>
  toValidGraphQLName(
    title || (ref && lastJsonPointerPathSegment(ref)) ||
      parentName,
  );

const distillPropertyName = (
  context: Context,
  objectName: string,
  propName: string,
): string => {
  if (isValidGraphQLName(propName)) {
    return propName;
  }
  const validName = toValidGraphQLName(propName);
  context.hooks.onPropertyRenamed?.(objectName, propName, validName);
  return validName;
};

const distillLeafType = (context: Context) => {
  const { hooks: { onEnumDistilled } } = context;
  return (ref: string | undefined, schema: OpenAPIV3.SchemaObject, parentName: string) => {
    if (isEnum(schema)) {
      const name = distillName(schema.title, ref, parentName);
      console.log("enum distilled", { title: schema.title, ref, parentName });
      onEnumDistilled?.(name, schema);
      // TODO: distill to GraphQLEnum if values are GraphQL compatible
      return G.GraphQLString;
    }
    if (isScalar(schema)) {
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
    }
    throw new Error(`Unsupported schema in "distillLeafType" function:
      ${stringify(schema, { maxDepth: 1 })}`);
  };
};

const distillInputType = (
  context: Context,
  boundDistillLeafType: ReturnType<typeof distillLeafType>,
) => {
  const { boundDereference } = context;
  const boundDistillInputType: (
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    parentName: string,
  ) => G.GraphQLInputType = dereferenceAndDistill<
    OpenAPIV3.SchemaObject,
    G.GraphQLInputType
  >(
    boundDereference,
    (ref, schema, parentName: string) => {
      if (isAlgebraic(schema)) {
        const name = distillName(schema.title, ref, parentName);
        const types = (schema.allOf || schema.anyOf || schema.oneOf)!.map((
          component,
          idx,
        ) => boundDistillInputType(component, `${name}_${idx}`));
        if (!types.every(G.isInputObjectType)) {
          throw new Error(
            [
              `Sorry, algebraic types could be composed only from object types.`,
              stringify(schema, { maxDepth: 2 }),
              `Above schema is composed from non-object types.`,
            ].join(`\n`),
          );
        }
        return mergeObjects(types, name && `${name}Input`);
      }
      if (isList(schema)) {
        return new G.GraphQLList(
          boundDistillInputType(schema.items, parentName),
        );
      }
      if (isObject(schema)) {
        const name = `${distillName(schema.title, ref, parentName)}Input`;
        const { required } = schema;
        return new G.GraphQLInputObjectType({
          description: schema.description,
          fields: Object.fromEntries(
            Object.entries(schema.properties).map(([propName, propSchema]) => {
              const derefSchema = boundDereference<OpenAPIV3.SchemaObject>(
                propSchema,
              )[0];
              const type = boundDistillInputType(
                propSchema,
                `${name}_${propName}`,
              );
              return [
                distillPropertyName(context, name, propName),
                {
                  description: derefSchema.description,
                  type: required?.includes(propName)
                    ? G.GraphQLNonNull(type)
                    : type,
                },
              ];
            }),
          ),
          name,
        });
      }
      return boundDistillLeafType(ref, schema, parentName);
    },
  );
  return boundDistillInputType;
};

const distillOutputType = (
  context: Context,
  boundDistillLeafType: ReturnType<typeof distillLeafType>,
) => {
  const { boundDereference, interfaceExtension } = context;

  const boundDistillOutputType: (
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    parentName: string,
  ) => G.GraphQLOutputType = dereferenceAndDistill<
    OpenAPIV3.SchemaObject,
    G.GraphQLOutputType
  >(
    boundDereference,
    (ref, schema, parentName: string) => {
      if (isAlgebraic(schema)) {
        const name = distillName(schema.title, ref, parentName);
        const union = !schema.allOf;
        const types = (schema.allOf || schema.anyOf || schema.oneOf)!.map((
          component,
          idx,
        ) => boundDistillOutputType(component, `${name}_${idx}`));
        if (!types.every(G.isObjectType)) {
          throw new Error(
            [
              `Sorry, algebraic types could be composed only from object types.`,
              stringify(schema, { maxDepth: 2 }),
              `Above schema is composed from non-object types.`,
            ].join(`\n`),
          );
        }
        if (union) {
          return new G.GraphQLUnionType({
            description: schema.description,
            name,
            types,
          });
        }
        const intersection = mergeObjects(types, name);
        (schema.allOf || schema.anyOf)!.forEach(
          (component, idx) => {
            if (isReference(component)) {
              const interfaceObject = types[idx];
              interfaceExtension.addInterfaceConnection(
                interfaceObject,
                intersection,
              );
            }
          },
        );
        return intersection;
      }
      if (isList(schema)) {
        return new G.GraphQLList(
          boundDistillOutputType(schema.items, parentName),
        );
      }
      if (isObject(schema)) {
        const name = distillName(schema.title, ref, parentName);
        const { required } = schema;
        const objectType = new G.GraphQLObjectType({
          description: schema.description,
          fields: Object.fromEntries(
            Object.entries(schema.properties).map(([propName, propSchema]) => {
              const derefSchema = boundDereference<OpenAPIV3.SchemaObject>(
                propSchema,
              )[0];
              const type = propName === `id` && isScalar(derefSchema)
                ? G.GraphQLID
                : boundDistillOutputType(
                  propSchema,
                  `${name}_${propName}`,
                );
              return [
                distillPropertyName(context, name, propName),
                {
                  description: derefSchema.description,
                  type: required?.includes(propName)
                    ? G.GraphQLNonNull(type)
                    : type,
                },
              ];
            }),
          ),
          name,
        });
        return objectType;
      }
      return boundDistillLeafType(ref, schema, parentName);
    },
  );
  return boundDistillOutputType;
};

const BODY: BodyArg = `body`;
const distillArguments = (
  context: Context,
  boundDistillInputType: ReturnType<typeof distillInputType>,
) => {
  const { boundDereference } = context;
  const boundDistillParameter = dereferenceAndDistill<
    OpenAPIV3.ParameterObject,
    DistilledOperationParameter
  >(boundDereference, (_ref, parameter, parentName) => {
    const { name, required = false } = parameter;
    if (parameter.in !== BODY && name === BODY) {
      throw new Error(
        `Invalid parameter ${stringify(parameter, { maxDepth: 1 })},
        \nOperation parameter MUST NOT have reserved name "${BODY}".`,
      );
    }
    const type = boundDistillInputType(
      parameter.schema as OpenAPIV3.SchemaObject,
      `${parentName}_${name}`,
    );
    return {
      description: parameter.description,
      in: parameter.in,
      required: Boolean(parameter.required),
      type: required ? G.GraphQLNonNull(type) : type,
      ...(isValidGraphQLName(name)
        ? { name }
        : { name: toValidGraphQLName(name), originalName: name }),
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
      dereferencedBody && boundDistillParameter(
        {
          in: BODY,
          name: BODY,
          schema: graphqlCompliantMediaType(dereferencedBody),
          required: dereferencedBody?.required,
        },
        operationId,
      ),
    ]
      .concat(
        parameters?.map((parameter) =>
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
    parameters?: Array<OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject>,
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
    const distilledArguments = boundDistillArguments(
      operationId,
      operation.requestBody,
      ([] as Array<
        OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject | undefined
      >).concat(parameters, operation.parameters).filter(Boolean) as Array<
        OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject
      >,
    );
    const successResponses = groupedResponses!.success!.map(
      // deno-lint-ignore no-explicit-any
      (R.compose as any)(graphqlCompliantMediaType, R.head, boundDereference),
    ) as Array<OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>;
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
        successResponses.length === 1
          ? successResponses[0]
          : createOneOf(successResponses),
        operationId,
      ),
    };

    // TODO: Do not generate types from error responses!
    // just to extract enums from the error responses,
    // groupedResponses!.error?.forEach((response) => {
    //   boundDistillOutputType(
    //     graphqlCompliantMediaType(
    //       boundDereference<OpenAPIV3.ResponseObject>(response)[0],
    //     ),
    //     operationId,
    //   );
    // });

    onOperationDistilled?.(
      path,
      httpMethod,
      operationId,
      fieldConfig,
      distilledArguments,
    );
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
  const interfaceExtension = interfaceExtensionFactory();
  const context: Context = {
    boundDereference: dereference(document),
    hooks,
    interfaceExtension,
  };
  const boundDistillLeafType = distillLeafType(context);
  const boundDistillInputType = distillInputType(
    context,
    boundDistillLeafType,
  );
  const boundDistillOutputType = distillOutputType(
    context,
    boundDistillLeafType,
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
      if (pathItemObject) {
        const { parameters } = pathItemObject;
        httpMethods.forEach((httpMethod) => {
          if (httpMethod in pathItemObject) {
            const { fieldConfig, fieldName } = boundDistillOperation(
              urlPath,
              httpMethod,
              pathItemObject[httpMethod] as OpenAPIV3.OperationObject,
              parameters,
            );
            acc[httpMethod === `get` ? `Query` : `Mutation`][fieldName] =
              fieldConfig;
          }
        });
      }
      return acc;
    }),
    { Mutation: {}, Query: {} } as {
      Mutation: Record<string, G.GraphQLFieldConfig<unknown, unknown>>;
      Query: Record<string, G.GraphQLFieldConfig<unknown, unknown>>;
    },
  );
  const schema = new G.GraphQLSchema({
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
  return interfaceExtension.extendSchema(schema);
};
