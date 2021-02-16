# GQL Refinery

This project is Work In Progress (WIP). Written for [Deno](https://deno.land). Node.js is currently not supported, although the code is structured to support Node.js in the future.

Many similar projects exists, but usually converts OAS to GraphQL engine, which could be run on the server. This project only transforms the OAS to `graphql.schema` and generates metadata for a very lightweight GQL engine, which runs in the browser.

Converts OpenAPI specification file to GraphQL Schema and generates:

* `apiArtifacts.json` - highly reduced metadata about the REST API and GQL types, needed for GQL runtime engine,
* `openapi.json` - the original passed OpenAPI document, just converted to JSON in case the input is YAML, to ease consuming of the OAS in runtime,
* `tsTypes.ts` with all enums found in the OAS, exported as TypeScript enums for simple usage.