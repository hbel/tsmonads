import { anyEquals, flatten as flattenHelper, type Monad } from "./helpers.ts";
import { Just, type Maybe, nothing, Nothing } from "./maybemonad.ts";

/**
 * Create an Either with a left (erroneous) value
 */
export function left<L>(value: L): Left<L> {
  if (value === null || value === undefined) {
    throw Error("Value must not be undefined or null!");
  }
  return new Left<L>(value);
}

/**
 * Create an Either with a right (correct) value
 */
export function right<R>(value: R): Right<R> {
  if (value === null || value === undefined) {
    throw Error("Value must not be undefined or null!");
  }
  return new Right<R>(value);
}

/** Either type (either a left or a right) */
export type Either<L, R> = Left<L> | Right<R>;

// deno-lint-ignore no-namespace
export namespace Either {
  /**
   * Turn an array of monads of T into a monad of array of T.
   */
  export function flatten<L, R>(coll: Array<Either<L, R>>): Either<L[], R[]> {
    return flattenHelper<R, Either<L, R>, Either<L, R>>(coll, empty) as Either<
      L[],
      R[]
    >;
  }

  /**
   * @returns an empty Either (left value)
   */
  export const empty = (): Left<Nothing> => left<Nothing>(nothing());
}

/**
 * Either monad
 */
export abstract class EitherBase<L, R> implements Monad<R, Either<L, R>> {
  /**
   * Whether the left holds a value
   */
  abstract isLeft: boolean;

  /**
   * Whether the right holds a value
   */
  abstract isRight: boolean;

  /**
   * Whether the monad has a value
   */
  abstract hasValue: boolean;

  /**
   * Return the start value if the monad is nothing, and f() of the monad if it contains a value
   */
  abstract reduce<V>(f: (total: V, current: R) => V, start: V): V;

  /**
   * Map the contained value with the given function. Note that the type of the left value does not change!
   */
  abstract map<V>(f: (x: R) => V): Either<L, V>;

  /**
   * FlatMap the monad using the given function which in turn will return a monad.
   * Note that the type of the left value does not change!
   */
  abstract flatMap<V>(f: (x: R) => Either<L, V>): Either<L, V>;

  /**
   * Return the "right value"
   */
  public unit<V>(x: V): Either<L, V> {
    return right<V>(x);
  }

  /**
   * Call forEach on the right value
   */
  abstract forEach(f: (x: R) => void): void;

  /**
   * Convert to maybe
   */
  abstract toMaybe(): Maybe<R>;

  /**
   * Convert to promise
   */
  abstract toPromise(): Promise<R>;

  /**
   * Check whether two Either instances are equal
   */
  public equals<U, V>(that: Left<U> | Right<V>): boolean {
    return anyEquals(this, that);
  }

  /**
   *
   * @returns an empty Either (left value)
   */
  public empty = (): Left<Nothing> => Either.empty();

  /**
   *
   * @returns whether the Either is empty (left)
   */
  public isEmpty(): boolean {
    return this.isLeft;
  }

  /**
   * Match the monad by executing a specific functions depending on wether it holds a left or right value
   */
  public abstract match<U>(left: (x: L) => U, right: (x: R) => U): U;
}

export class Left<L> extends EitherBase<L, never> {
  /** Constructor for Left (errornous) values */
  public constructor(public readonly value: L) {
    super();
  }

  /** @inheritdoc */
  public readonly isLeft = true;
  /** @inheritdoc */
  public readonly isRight = false;
  /** @inheritdoc */
  public readonly hasValue = false;

  /** @inheritdoc */
  public map<V>(_: (x: never) => V): Either<L, V> {
    return this;
  }

  /** @inheritdoc */
  public flatMap(_: (x: never) => Left<L> | Right<never>): Either<L, never> {
    return this;
  }

  /** @inheritdoc */
  public reduce<V>(_: (total: V, current: never) => V, start: V): V {
    return start;
  }

  /** @inheritdoc */
  public forEach(_: (x: never) => void): void {
    /**/
  }

  /** @inheritdoc */
  public toMaybe = (): Maybe<never> => new Nothing();

  /** @inheritdoc */
  public toPromise = async (): Promise<never> =>
    await Promise.reject(this.value);

  /** @inheritdoc */
  public match = <U>(left: (x: L) => U, _: (x: never) => U): U =>
    left(this.value);
}

export class Right<R> extends EitherBase<never, R> {
  /** Constructor for correct values */
  constructor(public readonly value: R) {
    super();
  }

  /** @inheritdoc */
  public readonly isLeft = false;
  /** @inheritdoc */
  public readonly isRight = true;
  /** @inheritdoc */
  public readonly hasValue = true;

  /** @inheritdoc */
  public reduce<V>(f: (total: V, current: R) => V, start: V): V {
    return f(start, this.value);
  }

  /** @inheritdoc */
  public map<V>(f: (x: R) => V): Either<never, V> {
    return right(f(this.value));
  }

  /** @inheritdoc */
  public flatMap<V>(f: (x: R) => Either<never, V>): Either<never, V> {
    return f(this.value);
  }

  /** @inheritdoc */
  public forEach(f: (x: R) => void): void {
    f(this.value);
  }

  /** @inheritdoc */
  public toMaybe = (): Maybe<R> => new Just(this.value);

  /** @inheritdoc */
  public toPromise = async (): Promise<R> => await Promise.resolve(this.value);

  /** @inheritdoc */
  public match = <U>(_left: (x: never) => U, right: (x: R) => U): U =>
    right(this.value);
}
