import snakeCase from "https://raw.githubusercontent.com/lodash/lodash/master/snakeCase.js";
import { R } from "./deps.ts";
import { Enums } from './types.d.ts'

// deno-lint-ignore no-explicit-any
export const toUpperSnakeCase = (R as any).compose(
  R.toUpper,
  snakeCase,
);

const printEnum = (name: string, values: string[]): string =>
  `enum ${name} {
${values.map((v) => `  ${toUpperSnakeCase(v)} = "${v}",`).join(`\n`)}
}`;

export const printEnums = (enums: Enums): string =>
  Array.from(enums.entries()).map(([name, values]) => printEnum(name, values))
    .join(`\n\n`);
