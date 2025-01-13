import { type Left, type Right, left, right } from "./eithermonad.ts";
import {
  anyEquals,
  chain as chainHelper,
  flatten as flattenHelper,
  forEach as forEachHelper,
  type Monad,
} from "./helpers.ts";

export const nothing = (): Nothing => new Nothing();

/**
 * Factory function for maybes. Depending on the argument will return a Just<T> or Nothing
 * @param val value to store in the maybe object
 */
export function maybe<T>(val: T | undefined | null): Just<T> | Nothing {
  if (val === null || val === undefined) {
    return new Nothing();
  } else {
    return new Just<T>(val);
  }
}

/**
 * Type alias for Maybe type.
 * @param T the type of value stored in the maybe object
 */
export type Maybe<T> = Just<T> | Nothing;

// deno-lint-ignore no-namespace
export namespace Maybe {
  /**
   * Remove one monadic level from the given Argument
   * @param monad the monadic value that holds the actual maybe
   * @returns the maybe value without one level of monad
   */
  // deno-lint-ignore no-explicit-any
  export function chain<T>(monad: Monad<Maybe<T>, any>): Maybe<T> {
    return chainHelper<T, Maybe<T>, Monad<Maybe<T>, unknown>>(
      monad
    ) as Maybe<T>;
  }

  /**
   * Turn an array of monads of T into a monad of array of T.
   * @param coll the array of maybes to flatten
   */
  export function flatten<T>(coll: Array<Maybe<T>>): Maybe<T[]> {
    return flattenHelper<T, Maybe<T>, Maybe<T>>(
      coll,
      empty
    ) as unknown as Maybe<T[]>;
  }

  /**
   * Returns the empty value (Nothing) of the maybe monad
   * @returns a monad without a value
   */
  export const empty = (): Nothing => nothing();
}

/**
 * Maybe monad.
 */
export abstract class MaybeBase<T, M> implements Monad<T, Maybe<T>> {
  /**
   *  Is this monad "nothing"?
   */
  public abstract nothing: true | false;

  /**
   *  Is this monad not "nothing"?
   */
  public abstract hasValue: true | false;
  /**
   * Map the contained value with the given function
   */
  public abstract map<V>(f: (x: T) => V): Maybe<V>;

  /**
   * FlatMap the monad using the given function which in turn will return a monad
   */
  public abstract flatMap<U>(f: (x: T) => Maybe<U>): Maybe<U>;

  /**
   * If the maybe contains nothing, return the Parameter, otherwise return the maybe itself
   */
  public abstract or<U>(defaultValue: Maybe<U>): Just<T> | Just<U> | Nothing;

  /**
   * Safe way to extract the value from the monad. If it contains
   * a value, return it, otherwise return the given default value
   */
  public abstract orElse(defaultValue: T): T;

  /**
   * Return the value from the monad or undefined if it is Nothing.
   */
  public abstract orUndefined(): T | undefined;

  /**
   * Returns true if the given function returns true for a Just, and false otherwise
   */
  public abstract is(f: (x: T) => boolean): boolean;

  /**
   * Match the monad by executing a specific functions if it holds a value,
   * and another function if not
   */
  public abstract match<U>(just: (x: T) => U, nothing: () => U): U;

  /**
   * Run forEach on the monad. Will be executed only if the monad
   * contains a value.
   */
  public abstract forEach(f: (x: T) => void): void;

  /** Return unit value (which is a Maybe) */
  public abstract unit<V>(x: V): Maybe<V>;

  /**
   * Return the start value if the monad is nothing, and f() of the monad if it contains a value
   */
  public abstract reduce<V>(f: (total: V, current: T) => V, start: V): V;

  /**
   * Check whether two maybes are equal
   */
  public abstract equals<U>(that: Maybe<U>): boolean;

  /** Convert maybe into an Either */
  public abstract toEither(error?: Error): Left<Error> | Right<T>;

  /**
   * Convert to promise
   */
  public abstract toPromise(error?: string): Promise<T>;

  /**
   * Returns an empty maybe
   */
  public abstract empty(): Maybe<T>;

  /** Returns whether this maybe contains no value */
  public abstract isEmpty(): boolean;
}

/**
 * Just class. If a maybe monad contains a value, it will be hold here.
 */
export class Just<T> implements MaybeBase<T, Maybe<T>> {
  /** @inheritdoc */
  public readonly nothing = false;
  /** @inheritdoc */
  public readonly hasValue = true;
  /** @inheritdoc */
  public unit = maybe;

  /** Create a Just from a value */
  constructor(public readonly value: T) {
    if (this.value === undefined || this.value === null) {
      throw new Error("Value must be not null and not undefined");
    }
  }

  /** @inheritdoc */
  public reduce<V>(f: (total: V, current: T) => V, _: V): V {
    return f(_, this.value);
  }

  /** @inheritdoc */
  public map<U>(f: (x: T) => U): Maybe<U> {
    return new Just<U>(f(this.value));
  }

  /** @inheritdoc */
  public flatMap<U>(f: (x: T) => Maybe<U>): Maybe<U> {
    return f(this.value);
  }

  /** @inheritdoc */
  public or<U>(_: Maybe<U>): Just<U> | Just<T> | Nothing {
    return this;
  }

  /** @inheritdoc */
  public orElse(_: T): T {
    return this.value;
  }

  /** @inheritdoc */
  public orUndefined(): T | undefined {
    return this.value;
  }

  /** @inheritdoc */
  public is(f: (x: T) => boolean): boolean {
    return f(this.value);
  }

  /** @inheritdoc */
  public match<U>(just: (x: T) => U, _: () => U): U {
    return just(this.value);
  }

  /** @inheritdoc */
  public forEach(f: (x: T) => void): void {
    f(this.value);
  }

  /** @inheritdoc */
  public equals<U>(that: Maybe<U>): boolean {
    return anyEquals(this, that);
  }

  /** @inheritdoc */
  public toEither(): Right<T> {
    return right(this.value);
  }

  /** @inheritdoc */
  public async toPromise(_error?: string): Promise<T> {
    return await Promise.resolve(this.value);
  }

  /** @inheritdoc */
  public empty = (): Maybe<T> => Maybe.empty();

  /** @inheritdoc */
  public isEmpty(): boolean {
    return false;
  }
}

/**
 * Nothing class. If a maybe monad contains no value, it will be of this type.
 */
export class Nothing implements MaybeBase<never, Maybe<never>> {
  /** @inheritdoc */
  public readonly nothing = true;
  public readonly hasValue = false;

  /** @inheritdoc */
  public unit = maybe;

  /** @inheritdoc */
  public reduce<V>(_f: (total: V, current: never) => V, start: V): V {
    return start;
  }

  /** @inheritdoc */
  public map<U>(_f: (x: never) => U): Maybe<U> {
    return nothing();
  }

  /** @inheritdoc */
  public flatMap<U>(_f: (x: never) => Maybe<U>): Maybe<U> {
    return nothing();
  }

  /** @inheritdoc */
  public or<U>(that: Maybe<U>): Maybe<U> {
    return that;
  }

  /** @inheritdoc */
  public orElse<T>(defaultValue: T): T {
    return defaultValue;
  }

  /** @inheritdoc */
  public orUndefined(): undefined {
    return undefined;
  }

  /** @inheritdoc */
  public is(_f: (x: never) => boolean): boolean {
    return false;
  }

  /** @inheritdoc */
  public match<U>(_: (x: never) => U, f: () => U): U {
    return f();
  }

  /** @inheritdoc */
  public forEach(_f: (x: never) => void): void {
    /**/
  }

  /** @inheritdoc */
  public equals<U>(that: MaybeBase<U, Maybe<U>>): boolean {
    return anyEquals(this, that);
  }

  /** @inheritdoc */
  public toEither(error?: Error): Left<Error> {
    return left(error ?? new Error("nothing"));
  }

  /** @inheritdoc */
  public async toPromise(error?: string): Promise<never> {
    return await Promise.reject(new Error(error ?? "nothing"));
  }

  /** @inheritdoc */
  public empty = (): Nothing => Maybe.empty();

  /** @inheritdoc */
  public isEmpty(): boolean {
    return true;
  }
}

/** Functional call of match for a maybe  */
export const match = <T, U>(
  mb: Maybe<T>,
  justFunction: (x: T) => U,
  nothingFunction: () => U
): U => mb.match(justFunction, nothingFunction);

/** Functional call of or for a maybe */
export const or = <T, U>(
  original: Maybe<T>,
  fallback: Maybe<U>
): Maybe<U> | Maybe<T> => original.or(fallback);

/** Functional call of orElse for a maybe */
export const orElse = <T>(original: Maybe<T>, fallback: T): T =>
  original.orElse(fallback);

/** Functional call of orUndefined for a maybe */
export const orUndefined = <T>(original: Maybe<T>): T | undefined =>
  original.orUndefined();
