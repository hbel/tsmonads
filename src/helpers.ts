import { nothing } from "./maybemonad";

/**
 * Base interface for monads. Defines a unit operation and a flatMap operation,
 * which are needed in all monads
 */
export interface Monad<T> {
    hasValue: boolean;
    unit<V>(value: V): Monad<V>;
    map<V>(f: (x: T) => V): Monad<V>;
    flatMap<V>(f: (x: T) => Monad<V>): Monad<V>;
    forEach(f: (x: T) => void): void;
    unsafeLift(): T;
    reduce<V>(f: (total: V, current: T) => V, start: V): V;
    equals<U>(that: Monad<U>): boolean;
}

export function anyEquals(x: any, y: any): boolean {
    if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
    if (x.constructor !== y.constructor) { return false; }
    if (x instanceof Function) { return x === y; }
    if (x instanceof RegExp) { return x === y; }
    if (x === y || x.valueOf() === y.valueOf()) { return true; }
    if (Array.isArray(x) && x.length !== y.length) { return false; }
    if (x instanceof Date) { return false; }
    if (!(x instanceof Object)) { return false; }
    if (!(y instanceof Object)) { return false; }
    const p = Object.keys(x);
    return Object.keys(y).every((i) => p.indexOf(i) !== -1) &&
        p.every((i) => anyEquals(x[i], y[i]));
}

// The flatten functions allows you to turn an array of monads of T into
// an monad of array of T.
export function flatten<T, U extends Monad<T>>(l: U[]): Monad<T[]> {
    if (!l) {
        throw new Error("Array is empty or non-existent");
    }
    if (l.length === 0) {
        return nothing();
    }
    const unit = l[0].unit;
    const rec = (l_: U[], r: T[]): any => {
        if (l_.length === 0) {
            return unit(r);
        }
        return l_[0].flatMap((x) => rec(l_.slice(1), r.concat([x])));
    };
    const empty: T[] = [];
    const ret = rec(l, empty);
    return ret;
}

// Remove all "empty" monads from an array of monads and lift the remaining values
export function clean<T, U extends Monad<T>>(coll: U[]): T[] {
    return coll.filter((elem) => elem.hasValue).map((elem) => elem.unsafeLift());
}

// Run foreach on an array of monads
export function forEach<T, U extends Monad<T>>(coll: U[], f: (x: T) => void): void {
    coll.forEach((y: Monad<T>) => y.forEach(f));
}

// Remove one monadic level from the given Argument
export function chain<T, U extends Monad<Monad<T>>>(monad: U): Monad<T> {
    return monad.flatMap((x) => x);
}
