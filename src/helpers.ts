import { type EitherBase, type Left, type Right } from "./eithermonad";
import { type Just, type MaybeBase, type Nothing, nothing } from "./maybemonad";
import { type Failure, type Success, type TryBase } from "./trymonad";

/**
 * Base interface for monads. Defines a unit operation and a flatMap operation,
 * which are needed in all monads
 */
export interface Monad<T> {
    hasValue: boolean;
    unit: <V>(value: V) => Monad<V>;
    map: <V>(f: (x: T) => V) => Monad<V>;
    flatMap: <V>(f: (x: T) => Monad<V>) => Monad<V>;
    forEach: (f: (x: T) => void) => void;
    reduce: <V>(f: (total: V, current: T) => V, start: V) => V;
    equals: <U>(that: Monad<U>) => boolean;
    toPromise: (error?: string) => Promise<T>;
    isEmpty: () => boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function anyEquals(x: any, y: any): boolean {
    if (x === null || x === undefined || y === undefined) {
        return x === y;
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unsafe-member-access
    if (x.constructor && y.constructor) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (x.constructor !== y.constructor) {
            return false;
        }
    }
    if (x instanceof Function && y instanceof Function) {
        return true;
    }
    if (x instanceof RegExp) {
        return x === y;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
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
type InferEither<T, U, V = Nothing> = T extends EitherBase<V, infer X>
    ? Right<U> | Left<V>
    : Monad<U>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type InferTry<T, U> = T extends TryBase<infer X>
    ? Success<U> | Failure
    : InferEither<T, U>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type InferMaybe<T, U> = T extends MaybeBase<infer X>
    ? Just<U> | Nothing
    : InferTry<T, U>;

// The flatten functions allows you to turn an array of monads of T into
// an monad of array of T.
export function flatten<T, U extends Monad<T>>(
    l: U[] | undefined,
    emptyFunc?: () => InferMaybe<U, T[]>
): InferMaybe<U, T[]> {
    if (l == null) {
        throw new Error("Array is empty or non-existent");
    }
    if (l.length === 0) {
        if (emptyFunc == null) {
            return nothing() as unknown as InferMaybe<U, T[]>;
        }
        return emptyFunc();
    }
    const unit = l[0].unit;
    const rec = (l_: U[], r: T[]): Monad<T[]> => {
        if (l_.length === 0) {
            return unit(r);
        }
        return l_[0].flatMap((x) => rec(l_.slice(1), r.concat([x])));
    };
    const empty: T[] = [];
    return rec(l, empty) as InferMaybe<U, T[]>;
}

// Remove all "empty" monads from an array of monads and lift the remaining values
export function clean<T, U extends Monad<T>>(coll: U[]): T[] {
    return coll
        .filter((elem) => elem.hasValue)
        .map((elem) => (elem as unknown as { value: T }).value);
}

// Run foreach on an array of monads
export function forEach<T, U extends Monad<T>>(
    coll: U[],
    f: (x: T) => void
): void {
    coll.forEach((y: Monad<T>) => {
        y.forEach(f);
    });
}

// Remove one monadic level from the given Argument
export function chain<T, U extends Monad<Monad<T>>>(
    monad: U
): InferMaybe<T, T> {
    return monad.flatMap((x) => x) as InferMaybe<T, T>;
}

export function map<T, U, V extends Monad<T>>(
    f: (x: T) => U,
    monad: V
): InferMaybe<V, U> {
    return monad.map(f) as InferMaybe<V, U>;
}

export function flatMap<T, U, V extends Monad<T>, W extends Monad<U>>(
    f: (x: T) => W,
    monad: V
): InferMaybe<V, U> {
    return monad.flatMap(f) as InferMaybe<V, U>;
}

export function is<T>(f: (x: T) => boolean, monad: Monad<T>): boolean {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    return monad.hasValue && !!(monad.map(f) as any).value;
}
