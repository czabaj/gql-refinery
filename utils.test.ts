import { assertEquals } from "https://deno.land/std@0.80.0/testing/asserts.ts";

import {
  convertOpenApiPathParamsToColonParams,
  toValidGraphQLName,
} from "./utils.ts";

Deno.test({
  name:
    `"convertOpenApiPathParamsToColonParams" should not change url without parameters`,
  fn() {
    assertEquals(
      convertOpenApiPathParamsToColonParams(`/api/gate`),
      `/api/gate`,
    );
  },
});

Deno.test(
  {
    name:
      `"convertOpenApiPathParamsToColonParams" should convert OpenAPI path parameter into colon parameter`,
    fn() {
      assertEquals(
        convertOpenApiPathParamsToColonParams(`/api/gate/{applicationSlug}`),
        `/api/gate/:applicationSlug`,
      );
    },
  },
);

Deno.test({
  name:
    `"convertOpenApiPathParamsToColonParams" should handle path parameter in middle of the path`,
  fn() {
    assertEquals(
      convertOpenApiPathParamsToColonParams(
        `/api/gate/{applicationSlug}/login`,
      ),
      `/api/gate/:applicationSlug/login`,
    );
  },
});

Deno.test({
  name:
    `"convertOpenApiPathParamsToColonParams" should handle more than one parameter in path`,
  fn() {
    assertEquals(
      convertOpenApiPathParamsToColonParams(
        `/my/contract/billing/{billingId}/spreadingOptions/{monthsCount}`,
      ),
      `/my/contract/billing/:billingId/spreadingOptions/:monthsCount`,
    );
  },
});

Deno.test({
  name: `"toValidGraphQLName" should leave valid GraphQL name without change`,
  fn() {
    [`foo`, `_foo`, `FooBar`, `Foo9`, `foo__9__bar`].forEach((validName) =>
      assertEquals(toValidGraphQLName(validName), validName)
    );
  },
});

Deno.test({
  name: `"toValidGraphQLName" shoud convert invalid GraphQL name to valid`,
  fn() {
    Object.entries({
      "9foo": `foo`,
      "foo-bar": `fooBar`,
    }).map(([invalidName, validName]) =>
      assertEquals(toValidGraphQLName(invalidName), validName)
    );
  },
});
