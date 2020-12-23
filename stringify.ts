const { isArray } = Array;

// deno-lint-ignore no-explicit-any
const isPlainObject = (value: any): value is Record<string, unknown> =>
  value && typeof value === `object` && !isArray(value);

// deno-lint-ignore ban-types
export function pipeLastArg(...fns: Function[]) {
  // deno-lint-ignore no-explicit-any
  return function (this: any, ...args: any[]) {
    const last = args.pop();
    return fns.reduce(
      (result, fn) => fn.apply(this, args.concat(result)),
      last,
    );
  };
}

// coppied from "JSON.stringify()" type
// deno-lint-ignore no-explicit-any
type Replacer = (this: any, key: string, value: any) => any;

const maxDepthReplacer = (maxDepth: number): Replacer | undefined => {
  if (maxDepth === 0) return undefined;
  if (maxDepth === 1) {
    return (k, v) =>
      k !== `` && v && typeof v === `object`
        ? isArray(v) ? `[object Array]` : `[object Object]`
        : v;
  }
  const depthTrack = new Map<Record<string, unknown>, number>();
  return function (k, v) {
    const currentDepth = depthTrack.get(this) || 0;
    if (v && typeof v === `object`) {
      if (currentDepth >= maxDepth) {
        return isArray(v) ? `[object Array]` : `[object Object]`;
      }
      depthTrack.set(v, currentDepth + 1);
    }
    return v;
  };
};

const serializeMapReplacer: Replacer = function serializeMapReplacer(k, v) {
  return v && v instanceof Map ? Object.fromEntries(v.entries()) : v;
};

function replacerPipe(replacers: Replacer[]): Replacer | undefined {
  return replacers.length === 0
    ? undefined
    : replacers.length === 1
    ? replacers[0]
    : pipeLastArg(...replacers);
}

/**
 * @param {number} [maxDepth = 1] max level of nested objects to stringify
 * @param {boolean} [supportMap] enables serialization of JS Map.
 */
function replacerFromOptions({
  maxDepth = 1,
  supportMap,
}: {
  maxDepth?: number;
  supportMap?: boolean;
}) {
  return replacerPipe(
    [supportMap && serializeMapReplacer, maxDepthReplacer(maxDepth)].filter(
      Boolean,
    ) as Replacer[],
  );
}

type ReplacerOptions = Parameters<typeof replacerFromOptions>[0];

/**
 * JSON.stringify on steroids, second argument could be an object with options to create replacer.
 * E.g. `stringify(obj, { maxDepth: 2 })` to print only items 2 levels deep in an object.
 * Used for readable error logs.
 */
export const stringify = (
  // deno-lint-ignore no-explicit-any
  value: any,
  replacer?:
    | ReplacerOptions
    | Parameters<typeof JSON.stringify>[1],
  space?: Parameters<typeof JSON.stringify>[2],
): string =>
  JSON.stringify(
    value,
    isPlainObject(replacer)
      ? replacerFromOptions(replacer as ReplacerOptions)
      : // deno-lint-ignore no-explicit-any
        (replacer as any),
    space,
  );
