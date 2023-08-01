import { Either, Left, Right, left, right } from "./eithermonad";
import { anyEquals, chain, flatten, Monad } from "./helpers";

export const nothing = () => new Nothing();

// Factory function for maybes. Depending on the argument will return a Just<T> or Nothing
export function maybe<T>(val: T | undefined | null): Just<T> | Nothing {
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
    public static chain<T, U extends Maybe<Maybe<T>>>(monad: U): Just<T> | Nothing {
        return chain(monad) as Just<T> | Nothing;
    }

    /**
     * Turn an array of monads of T into a monad of array of T.
     */
    public static flatten<T>(coll: Array<Maybe<T>>): Just<T[]> | Nothing {
        return flatten(coll, Maybe.empty) as Just<T[]> | Nothing;
    }

    /**
     *  Is this monad "nothing"?
     */
    public nothing: true | false;

    /**
     *  Is this monad not "nothing"?
     */
    public hasValue: true | false;
    /**
     * Map the contained value with the given function
     */
    public abstract map<U>(f: (x: T) => U): Just<U> | Nothing;

    /**
     * FlatMap the monad using the given function which in turn will return a monad
     */
    public abstract flatMap<U>(f: (x: T) => Just<U> | Nothing): Just<U> | Nothing;

    /**
     * If the maybe contains nothing, return the Parameter, otherwise return the maybe itself
     */
    public abstract or<U>(defaultValue: Just<U> | Nothing): Just<T> | Just<U> | Nothing;

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

    public abstract unit<V>(x: V): Maybe<V>;

    /**
     * Return the start value if the monad is nothing, and f() of the monad if it contains a value
     */
    public abstract reduce<V>(f: (total: V, current: T) => V, start: V): V;

    /**
     * Check whether two maybes are equal
     */
    public abstract equals<U>(that: Maybe<U>): boolean;

	public abstract toEither(error?: Error): Left<Error> | Right<T>;

	/**
     * Convert to promise
     */
	public abstract toPromise(error?: string): Promise<T>;

	public static empty = () => nothing();

	public abstract empty(): Just<T> | Nothing;

	public abstract isEmpty(): boolean;
}

/**
 * Just class. If a maybe monad contains a value, it will be hold here.
 */
export class Just<T> implements Maybe<T> {

    public readonly nothing = false;
    public readonly hasValue = true;

    public unit = maybe;

    constructor(public readonly value: T) {
        if (this.value === undefined || this.value === null) {
            throw new Error("Value must be not null and not undefined");
        }
    }

    public reduce<V>(f: (total: V, current: T) => V, _: V) { return f(_, this.value); }

    public map<U>(f: (x: T) => U): Just<U> | Nothing {
        return new Just<U>(f(this.value));
    }

    public flatMap<U>(f: (x: T) => Just<U> | Nothing): Just<U> | Nothing {
        return f(this.value);
    }

    public or<U>(_: Just<U> | Nothing): Just<U> | Just<T> | Nothing {
        return this;
    }

    public orElse(_: T): T {
        return this.value;
    }

    public orUndefined(): T | undefined {
        return this.value;
    }

    public is(f: (x: T) => boolean): boolean {
        return f(this.value);
    }

    public match<U>(just: (x: T) => U, _: () => U): U { return just(this.value); }

    public forEach(f: (x: T) => void): void { f(this.value); }

    public equals<U>(that: Maybe<U>): boolean {
        return anyEquals(this, that);
    }

	public toEither(): Right<T> { return right(this.value); }

	/**
     * Convert to promise
     */
	public toPromise(_error?: string): Promise<T> { return Promise.resolve(this.value) }

	public empty = () => Maybe.empty();

	public isEmpty() { return false; }
}

/**
 * Nothing class. If a maybe monad contains no value, it will be of this type.
 */
export class Nothing implements Maybe<never> {

    public readonly nothing = true;
    public readonly hasValue = false;

    public unit = maybe;

    public reduce<V>(_f: (total: V, current: never) => V, start: V) { return start; }

    public map<U>(_f: (x: never) => U): Just<U> | Nothing {
        return nothing();
    }

    public flatMap<U>(_f: (x: never) => Just<U> | Nothing): Just<U> | Nothing {
        return nothing();
    }

    public or<U>(that: Just<U> | Nothing): Just<U> | Nothing {
        return that;
    }

    public orElse<T>(defaultValue: T): T {
        return defaultValue;
    }

    public orUndefined(): undefined {
        return undefined;
    }

    public is(_f: (x: never) => boolean): boolean {
        return false;
    }

    public match<U>(_: (x: never) => U, f: () => U): U { return f(); }

    public forEach(_f: (x: never) => void): void { return; }

    public equals<U>(that: Maybe<U>): boolean {
        return anyEquals(this, that);
    }

	public toEither(error?: Error): Left<Error> { return left(error ?? new Error("nothing")) }

	/**
     * Convert to promise
     */
	public toPromise(error?: string): Promise<never> { return Promise.reject(new Error(error ?? "nothing")); }

	public empty = () => Maybe.empty();

	public isEmpty() { return true; }
}

export const match = <T,U>(mb: Maybe<T>, justFunction: (x: T) => U, nothingFunction: () => U): U => mb.match(justFunction, nothingFunction);
export const or = <T,U>(original: Maybe<T>, fallback: Just<U> | Nothing) => original.or(fallback);
export const orElse = <T>(original: Maybe<T>, fallback: T) => original.orElse(fallback);
export const orUndefined = <T>(original: Maybe<T>) => original.orUndefined();
