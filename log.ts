export * as color from "https://deno.land/std@0.80.0/fmt/colors.ts";

export { stringify } from "./stringify.ts";

// deno-lint-ignore no-explicit-any
export const log = (...args: any[]) => console.log(...args);
