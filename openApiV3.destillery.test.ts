import { assertEquals, assertThrows } from "testing/asserts.ts";

import { R } from "./deps.ts";
import { distillOperation } from "./openApiV3.destillery.ts";

Deno.test(`"distillOperation" should throw when 'operationId' is void`, () => {
  // deno-lint-ignore no-explicit-any
  const context = { apiArtifacts: { operations: [] } } as any;
  const distillResponseWContext = distillOperation(
    context,
    R.always(undefined),
  );
  assertThrows(() => distillResponseWContext(`/some/path`, `get`, {}));
});
