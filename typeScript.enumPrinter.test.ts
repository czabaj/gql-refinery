import {
  assertEquals,
} from "https://deno.land/std@0.80.0/testing/asserts.ts";

import { toUpperSnakeCase } from "./typeScript.enumPrinter.ts";

Deno.test({
  name: `"toSnakeCase" should convert to snake case`,
  fn() {
    [
      [`foo`, `FOO`],
      [`foo1`, `FOO_1`],
      [`fooBar`, `FOO_BAR`],
      [`_f`, `F`],
      [`foo-bar`, `FOO_BAR`],
    ].forEach(([input, expected]) => {
      assertEquals(toUpperSnakeCase(input), expected);
    });
  },
});
