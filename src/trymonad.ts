import { type Either, left, right } from "../monads.ts";
import {
  anyEquals,
  chain as chainHelper,
  flatten as flattenHelper,
  type Monad,
} from "./helpers.ts";
import { type Maybe, maybe, Nothing } from "./maybemonad.ts";

/**
 * Tries to call the given function. Returns a Success if
 * no exception occurred, otherwise returns a Failure containing the error
 */
export function call<T>(f: () => T): Success<T> | Failure {
  try {
    const result = f();
    return fromValue(result);
  } catch (ex) {
    if (ex instanceof Error) return fromError(ex);
    return fromError(new Error("Received no error object"));
  }
}

/**
 * Wraps the given promise into a Try monad
 * @param p Promise
 * @returns Promise of a Try monad
 */
export async function wrapPromise<T>(
  p: () => Promise<T>,
): Promise<Success<T> | Failure> {
  return await p()
    .then((s) => new Success(s))
    .catch((e: Error) => new Failure(e));
}

/**
 * Try type. Is either an Success (containing the return value) or a Failure (containing the error)
 */
export type Try<T> = Success<T> | Failure;

// deno-lint-ignore no-namespace
export namespace Try {
  /**
   * Remove one monadic level from the given Argument
   */
  // deno-lint-ignore no-explicit-any
  export function chain<T>(monad: Monad<Try<T>, any>): Try<T> {
    return chainHelper<T, Try<T>, Monad<Try<T>, unknown>>(monad) as Try<T>;
  }

  /**
   * Turn an array of monads of T into a monad of array of T.
   */
  export function flatten<T>(coll: Array<Try<T>>): Try<T[]> {
    return flattenHelper<T, Try<T>, Try<T>>(coll, empty) as unknown as Try<T[]>;
  }

  /**
   * @returns a Try without a value (which is a Failure)
   */
  export const empty = (): Failure => new Failure(new Error());
}

/**
 * Create a try from a variable containing either an Error or a value
 * @param errorOrValue value or an error
 * @returns Try object
 */
export function fromErrorOrValue<T, E extends Error>(
  errorOrValue: E | T,
): Try<T> {
  if (errorOrValue instanceof Error) {
    return fromError(errorOrValue);
  }
  return fromValue(errorOrValue);
}

/**
 * Create a Try from an Error
 * @param error error object
 * @returns Try object
 */
export function fromError<T, E extends Error>(error: E): Try<T> {
  return new Failure(error);
}

/**
 * Create a try from a value
 * @param value value to wrap in the try
 * @returns Try object
 */
export function fromValue<T>(value: T): Try<T> {
  return new Success(value);
}

/**
 *  Try monad
 */
export abstract class TryBase<T> implements Monad<T, Try<T>> {
  /** Whether the call has succeeded without an exception */
  public abstract succeeded: true | false;

  /**
   *  Is this monad not "nothing"?
   */
  public abstract hasValue: true | false;

  /**
   * Function that should be called if this is a Success
   */
  public abstract onSuccess(f: (x: T) => void): Try<T>;

  /**
   * Function to be called if this is a Failure
   */
  public abstract onFailure(f: (error: Error) => void): Try<T>;

  /**
   * Map the result using another function
   */
  public abstract map<U>(f: (x: T) => U): Try<U>;

  /**
   * Flat map the result
   */
  public abstract flatMap<U>(f: (x: T) => Try<U>): Try<U>;

  /**
   * Run forEach on the monad. Will be executed only if the monad
   * contains a value.
   */
  public abstract forEach(f: (x: T) => void): void;

  /**
   * Convert try into a maybe
   */
  public abstract toMaybe(): Maybe<T>;

  public abstract unit<V>(x: V): Try<V>;

  /**
   * Return the start value if the monad is nothing, and f() of the monad if it contains a value
   */
  public abstract reduce<V>(f: (total: V, current: T) => V, start: V): V;

  /**
   * Check whether two Try instances are equal
   * @param that
   */
  public abstract equals<U>(that: Try<U>): boolean;

  /**
   * Convert to promise
   */
  public abstract toPromise(): Promise<T>;

  /**
   * Convert to Either
   */
  public abstract toEither(): Either<Error, T>;

  /**
   * Check whether the Try contains a value
   */
  public abstract isEmpty(): boolean;

  /**
   * Match the monad by executing a specific functions depending on wether it holds a success or failure
   */
  public abstract match<U>(success: (x: T) => U, failure: (x: Error) => U): U;
}

export class Success<T> implements TryBase<T> {
  /** Creates a new Success object from a value */
  constructor(public readonly value: T) {}

  /** @inheritdoc */
  public onSuccess(f: (x: T) => void): Try<T> {
    f(this.value);
    return this;
  }

  /** @inheritdoc */
  public onFailure(_: (error: Error) => void): Try<T> {
    return this;
  }

  /** @inheritdoc */
  public reduce<V>(f: (total: V, current: T) => V, start: V): V {
    return f(start, this.value);
  }

  /** @inheritdoc */
  public readonly succeeded = true;

  /** @inheritdoc */
  public get result(): T {
    return this.value;
  }

  /** @inheritdoc */
  public map<U>(f: (x: T) => U): Try<U> {
    return call<U>(() => f(this.value));
  }

  /** @inheritdoc */
  public flatMap<U>(f: (x: T) => Try<U>): Try<U> {
    return f(this.value);
  }

  /** @inheritdoc */
  public unit<V>(x: V): Try<V> {
    return call(() => x);
  }

  /** @inheritdoc */
  public forEach = (f: (x: T) => void): void => {
    f(this.value);
  };

  /** @inheritdoc */
  public readonly hasValue = true;

  /** @inheritdoc */
  public toMaybe = (): Maybe<T> => maybe(this.value);

  /** @inheritdoc */
  public equals<U>(that: Try<U>): boolean {
    return anyEquals(this, that);
  }

  /** @inheritdoc */
  public async toPromise(): Promise<T> {
    return await Promise.resolve(this.value);
  }

  /** @inheritdoc */
  public isEmpty(): boolean {
    return false;
  }

  /** @inheritdoc */
  public empty = (): Failure => Try.empty();

  /** @inheritdoc */
  public toEither = (): Either<Error, T> => right(this.value);

  /** @inheritdoc */
  public match = <U>(success: (x: T) => U, _: (x: Error) => U): U =>
    success(this.value);
}

export class Failure implements TryBase<never> {
  /** Creates a new Failure object from an error */
  constructor(private readonly _error: Error) {}

  /** @inheritdoc */
  public onSuccess(_f: (x: never) => void): Try<never> {
    return this;
  }

  /** @inheritdoc */
  public onFailure(f: (error: Error) => void): Try<never> {
    f(this._error);
    return this;
  }

  /** @inheritdoc */
  public reduce<V>(_: (total: V, current: never) => V, start: V): V {
    return start;
  }

  /** @inheritdoc */
  public readonly succeeded = false;

  /** @inheritdoc */
  public get error(): Error {
    return this._error;
  }

  /** @inheritdoc */
  public map<U>(_f: (x: never) => U): Try<U> {
    return this;
  }

  /** @inheritdoc */
  public flatMap<U>(_f: (x: never) => Try<U>): Try<U> {
    return this;
  }

  /** @inheritdoc */
  public unit<V>(x: V): Try<V> {
    return call(() => x);
  }

  /** @inheritdoc */
  public forEach(_f: (x: never) => void): void {}

  /** @inheritdoc */
  public readonly hasValue = false;

  /** @inheritdoc */
  public toMaybe = (): Nothing => new Nothing();

  /** @inheritdoc */
  public equals<U>(that: Try<U>): boolean {
    return anyEquals(this, that);
  }

  /** @inheritdoc */
  public async toPromise(): Promise<never> {
    return await Promise.reject(this._error);
  }

  /** @inheritdoc */
  public isEmpty(): boolean {
    return true;
  }

  /** @inheritdoc */
  public empty = (): Failure => Try.empty();

  /** @inheritdoc */
  public toEither = (): Either<Error, never> => left(this.error);

  /** @inheritdoc */
  public match = <U>(_: (x: never) => U, failure: (x: Error) => U): U =>
    failure(this.error);
}
