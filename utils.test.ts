import { assertEquals } from "testing/asserts.ts";

import { convertOpenApiPathParamsToColonParams } from "./utils.ts";

Deno.test(`should not change url without parameters`, () => {
  assertEquals(convertOpenApiPathParamsToColonParams(`/api/gate`), `/api/gate`);
});

Deno.test(`should convert OpenAPI path parameter into colon parameter`, () => {
  assertEquals(
    convertOpenApiPathParamsToColonParams(`/api/gate/{applicationSlug}`),
    `/api/gate/:applicationSlug`,
  );
});

Deno.test(`should handle path parameter in middle of the path`, () => {
  assertEquals(
    convertOpenApiPathParamsToColonParams(`/api/gate/{applicationSlug}/login`),
    `/api/gate/:applicationSlug/login`,
  );
});
