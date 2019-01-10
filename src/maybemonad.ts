import {chain, flatten, Monad} from "./helpers";

export const nothing = () => new Nothing();

// Factory function for maybes. Depending on the argument will return a Just<T> or Nothing
export function maybe<T>(val: T | undefined | null): Maybe<T> {
    if (val === null || val === undefined) {
        return new Nothing();
    } else {
        return new Just<T>(val);
    }
}

/**
 * Maybe monad.
 */
export abstract class Maybe<T> implements Monad<T> {

    /**
     * Remove one monadic level from the given Argument
     */
    public static chain<T, U extends Maybe<Maybe<T>>>(monad: U): Maybe<T> {
        return chain(monad) as Maybe<T>;
    }

    /**
     * Turn an array of monads of T into a monad of array of T.
     */
    public static flatten<T>(coll: Array<Maybe<T>>): Maybe<T[]> {
        return flatten(coll) as Maybe<T[]>;
    }

    /**
     *  Is this monad "nothing"?
     */
    public nothing: boolean;

    /**
     *  Is this monad not "nothing"?
     */
    public hasValue: boolean;
    /**
     * Map the contained value with the given function
     */
    public abstract map<U>(f: (x: T) => U): Maybe<U>;

    /**
     * FlatMap the monad using the given function which in turn will return a monad
     */
    public abstract flatMap<U>(f: (x: T) => Maybe<U>): Maybe<U>;

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
     *  Lift the monad to get its value. Note that this will cause
     *  a runtime error if the monad is Nothing!
     */
    public abstract unsafeLift(): T;

    /**
     * Match the monad by executing a specific funtions if it holds a value,
     * and another function if not
     */
    public abstract match<U>(just: (x: T) => U, nothing: () => U): U;

    /**
     * Run forEach on the monad. Will be executed only if the monad
     * contains a value.
     */
    public abstract forEach(f: (x: T) => void): void;

    public abstract unit<V>(x: V): Maybe<V>;

    /**
     * Return the start value if the monad is nothing, and f() of the monad if it contains a value
     */
    public abstract reduce<V>(f: (total: V, current: T) => V, start: V): V;
}

/**
 * Just class. If a maybe monad contains a value, it will be hold here.
 */
export class Just<T> implements Maybe<T> {

    get nothing(): boolean { return false; }
    get hasValue(): boolean { return true; }

    public unit = maybe;

    constructor(private readonly _value: T) {
        if (this._value === undefined || this._value === null) {
            throw new Error("Value must be not null and not undefined");
        }
    }

    public reduce<V>(f: (total: V, current: T) => V, _: V) { return f(_, this._value); }

    public map<U>(f: (x: T) => U): Maybe<U> {
        return new Just<U>(f(this._value));
    }

    public flatMap<U>(f: (x: T) => Maybe<U>): Maybe<U> {
        return f(this._value);
    }

    public orElse(_: T): T {
        return this._value;
    }

    public orUndefined(): T | undefined {
        return this._value;
    }

    public is(f: (x: T) => boolean): boolean {
        return f(this._value);
    }

    public unsafeLift(): T {
        return this._value;
    }

    public match<U>(just: (x: T) => U, _: () => U): U { return just(this._value); }

    public forEach(f: (x: T) => void): void { f(this._value); }
}

/**
 * Nothing class. If a maybe monad contains no value, it will be of this type.
 */
export class Nothing implements Maybe<any> {

    get nothing(): boolean { return true; }
    get hasValue(): boolean { return false; }

    public unit = maybe;

    public reduce<V>(f: (total: V, current: any) => V, start: V) { return start; }

    public map<T, U>(f: (x: T) => U): Maybe<U> {
        return nothing();
    }

    public flatMap<T, U>(f: (x: T) => Maybe<U>): Maybe<U> {
        return nothing();
    }

    public orElse<T>(defaultValue: T): T {
        return defaultValue;
    }

    public orUndefined(): undefined {
        return undefined;
    }

    public is(f: (x: any) => boolean): boolean {
        return false;
    }

    public unsafeLift<T>(): T {
        throw new Error("Nothing contains no value");
    }

    public match<U>(_: (x: any) => U, f: () => U): U { return f(); }

    // tslint:disable-next-line:no-empty
    public forEach(f: (x: any) => void): void {}
}
