import { assertEquals } from "testing/asserts.ts";

import { dereferenceSchema } from "./dereferenceJsonSchema.ts";
import { loadFile } from "./utils.ts";

Deno.test(`Should dereference local JSON pointers`, async () => {
  assertEquals(
    dereferenceSchema(await loadFile(`./__fixtures__/schemas/anyofref.json`)),
    await loadFile(`./__fixtures__/schemas/anyofref.expected.json`),
  );
});

Deno.test(`Should handle OpenAPI schema`, async () => {
  assertEquals(
    dereferenceSchema(await loadFile(`./__fixtures__/petstore.yaml`)),
    await loadFile(`./__fixtures__/petstore.dereferenced.yaml`),
  );
});
