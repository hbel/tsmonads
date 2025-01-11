import type { EitherBase, Left, Right } from "./eithermonad.ts";
import {
  type Just,
  type MaybeBase,
  type Nothing,
  nothing,
} from "./maybemonad.ts";
import type { Failure, Success, TryBase } from "./trymonad.ts";

/**
 * Base interface for monads. Defines a unit operation and a flatMap operation,
 * which are needed in all monads
 */
export interface Monad<T, M> {
  hasValue: boolean;
  unit<V>(value: V): Monad<V, M>;
  map<V>(f: (x: T) => V): Monad<V, M>;
  flatMap<V>(f: (x: T) => Monad<V, M>): Monad<V, M>;
  forEach: (f: (x: T) => void) => void;
  reduce: <V>(f: (total: V, current: T) => V, start: V) => V;
  equals: <U>(that: M) => boolean;
  toPromise: (error?: string) => Promise<T>;
  isEmpty: () => boolean;
}

// deno-lint-ignore no-explicit-any
export function anyEquals(x: any, y: any): boolean {
  if (x === null || x === undefined || y === undefined) {
    return x === y;
  }
  if (x.constructor && y?.constructor) {
    if (x.constructor !== y?.constructor) {
      return false;
    }
  }
  if (x instanceof Function && y instanceof Function) {
    return true;
  }
  if (x instanceof RegExp && y instanceof RegExp) {
    return x === y;
  }
  if (x === y || x.valueOf() === y.valueOf()) {
    return true;
  }
  if (Array.isArray(x) && Array.isArray(y) && x.length !== y.length) {
    return false;
  }
  if (x instanceof Date) {
    return false;
  }
  if (!(x instanceof Object)) {
    return false;
  }
  if (!(y instanceof Object)) {
    return false;
  }
  const p = Object.keys(x as Record<string, unknown>);
  return (
    Object.keys(y as Record<string, unknown>).every((i) => p.includes(i)) &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    p.every((i) => anyEquals(x[i], y[i]))
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type InferEither<T, U, M, V = Nothing> = T extends EitherBase<V, infer X>
  ? Right<U> | Left<V>
  : Monad<U, M>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type InferTry<T, U, M> = T extends TryBase<infer X>
  ? Success<U> | Failure
  : InferEither<T, U, M, Nothing>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type InferMaybe<T, U, M> = T extends MaybeBase<infer X, M>
  ? Just<U> | Nothing
  : InferTry<T, U, M>;

// The flatten functions allows you to turn an array of monads of T into
// an monad of array of T.
export function flatten<T, M, U extends Monad<T, M>>(
  l: U[] | undefined,
  emptyFunc?: () => InferMaybe<U, T[], M>
): InferMaybe<U, T[], M> {
  if (l == null) {
    throw new Error("Array is empty or non-existent");
  }
  if (l.length === 0) {
    if (emptyFunc == null) {
      return nothing() as unknown as InferMaybe<U, T[], M>;
    }
    return emptyFunc();
  }
  const unit = l[0].unit;
  const rec = (l_: U[], r: T[]): Monad<T[], M> => {
    if (l_.length === 0) {
      return unit(r);
    }
    return l_[0].flatMap((x) => rec(l_.slice(1), r.concat([x])));
  };
  const empty: T[] = [];
  return rec(l, empty) as InferMaybe<U, T[], M>;
}

// Remove all "empty" monads from an array of monads and lift the remaining values
export function clean<T, M, U extends Monad<T, M>>(coll: U[]): T[] {
  return coll
    .filter((elem) => elem.hasValue)
    .map((elem) => (elem as unknown as { value: T }).value);
}

// Run foreach on an array of monads
export function forEach<T, M, U extends Monad<T, M>>(
  coll: U[],
  f: (x: T) => void
): void {
  coll.forEach((y: Monad<T, M>) => {
    y.forEach(f);
  });
}

// Remove one monadic level from the given Argument
export function chain<T, M, U extends Monad<Monad<T, M>, M>>(
  monad: U
): InferMaybe<T, T, M> {
  return monad.flatMap((x) => x) as InferMaybe<T, T, M>;
}

export function map<T, U, M, V extends Monad<T, M>>(
  f: (x: T) => U,
  monad: V
): InferMaybe<V, U, M> {
  return monad.map(f) as InferMaybe<V, U, M>;
}

export function flatMap<T, U, M, V extends Monad<T, M>, W extends Monad<U, M>>(
  f: (x: T) => W,
  monad: V
): InferMaybe<V, U, M> {
  return monad.flatMap(f) as unknown as InferMaybe<V, U, M>;
}

export function is<T, M>(f: (x: T) => boolean, monad: Monad<T, M>): boolean {
  return (
    monad.hasValue && !!(monad.map(f) as unknown as { value: boolean }).value
  );
}
