import { assertEquals } from "testing/asserts.ts";

import { stringify } from "./stringify.ts";

Deno.test(`should print only chosen maxDepth during serializing`, () => {
  const deepObject = {
    enten: {
      tyky: {
        dva: {
          spaliky: {
            cert: {
              vyletel: {
                z: `elektriky`,
              },
            },
          },
        },
      },
    },
  };

  assertEquals(
    stringify(deepObject, { maxDepth: 3 }),
    `{"enten":{"tyky":{"dva":"[object Object]"}}}`,
  );
});

Deno.test(`should handle serialization of Map objects with respect to maxDepts`, () => {
  const deepObjectWithMap = {
    enten: {
      tyky: new Map([
        [
          "dva",
          new Map([
            [
              "spaliky",
              {
                cert: {
                  vyletel: {
                    z: `elektriky`,
                  },
                },
              },
            ],
          ]),
        ],
      ]),
    },
  };

  assertEquals(
    stringify(deepObjectWithMap, { maxDepth: 3, supportMap: true }),
    `{"enten":{"tyky":{"dva":"[object Object]"}}}`,
  );
});

Deno.test(`should print first level when "maxDepth" is 1`, () => {
  const object = { foo: 1, bar: { ara: "rat" } };

  assertEquals(
    stringify(object, { maxDepth: 1 }),
    `{"foo":1,"bar":"[object Object]"}`,
  );
});
