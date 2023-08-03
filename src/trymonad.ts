import { anyEquals, chain as chainHelper, flatten as flattenHelper, Monad } from "./helpers";
import { Maybe, maybe, Nothing } from "./maybemonad";

/**
 * Tries to call the given function. Returns a Success if
 * no exception occurred, otherwise returns a Failure containing the error
 */
export function call<T>(f: () => T): Success<T> | Failure {
    try {
        const result = f();
        return fromValue(result);
    }
    catch (ex) {
        return fromError(ex);
    }
}

/**
 * Wraps the given promise into a Try monad
 * @param p Promise
 * @returns Promise of a Try monad
 */
export function wrapPromise<T>(p: () => Promise<T>): Promise<Success<T> | Failure> {
	return p().then(s => new Success(s)).catch(e => new Failure(e));
}

export type Try<T> = Success<T> | Failure;

/**
     * Remove one monadic level from the given Argument
     */
export function chain<T, U extends Try<Try<T>>>(monad: U): Try<T> {
	return chainHelper(monad) as Try<T>;
}

/**
 * Turn an array of monads of T into a monad of array of T.
 */
export function flatten<T>(coll: Array<Try<T>>): Try<T[]> {
	return flattenHelper(coll, empty);
}

export function fromError<T, E extends Error>(error: E): Try<T> {
	return new Failure(error);
}

export function fromValue<T>(value: T): Try<T> {
	return new Success(value);
}

export const empty = () => new Failure(new Error());


/**
 *  Try monad
 */
export abstract class TryBase<T> implements Monad<T> {


    // Whether the call has succeeded without an exception
    public succeeded: true | false;

    /**
     *  Is this monad not "nothing"?
     */
    public hasValue: true | false;
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

	public abstract isEmpty(): boolean;
}

export class Success<T> implements TryBase<T> {
    constructor(public readonly value: T) { }

    public onSuccess(f: (x: T) => void): Try<T> { f(this.value); return this; }

    public onFailure(_: (error: Error) => void): Try<T> { return this; }

    public reduce<V>(f: (total: V, current: T) => V, start: V): V { return f(start, this.value); }

    public readonly succeeded = true;

    public get result(): T { return this.value; }

	public map<U>(f: (x: T) => U): Try<U> {
        return call<U>(() => f(this.value));
    }

    public flatMap<U>(f: (x: T) => Try<U>): Try<U> {
        return f(this.value);
    }

    public unit<V>(x: V): Try<V> {
        return call(() => x);
    }

    public forEach = (f: (x: T) => void): void => f(this.value);

    public readonly hasValue = true;

    public toMaybe = () => maybe(this.value);

    public equals<U>(that: Try<U>): boolean {
        return anyEquals(this, that);
    }

	public toPromise(): Promise<T> { return Promise.resolve(this.value) }

	public isEmpty() { return false; }

	public empty = () => empty();
}

export class Failure implements TryBase<never> {
    constructor(private readonly _error: Error) { }

    public onSuccess(_f: (x: never) => void): Try<never> { return this; }

    public onFailure(f: (error: Error) => void): Try<never> { f(this._error); return this; }

    public reduce<V>(_: (total: V, current: never) => V, start: V): V { return start; }

    public readonly succeeded = false;

    public get error(): Error { return this._error; }

    public map<U>(_f: (x: never) => U): Try<U> {
        return this;
    }

    public flatMap<U>(_f: (x: never) => Try<U>): Try<U> {
        return this;
    }

    public unit<V>(x: V): Try<V> {
        return call(() => x);
    }

    // tslint:disable-next-line:no-empty
    public forEach(_f: (x: never) => void): void { return; }

    public readonly hasValue = false;

    public toMaybe = () => new Nothing();

    public equals<U>(that: Try<U>): boolean {
        return anyEquals(this, that);
    }

	public toPromise(): Promise<never> { return Promise.reject(this._error); }

	public isEmpty() { return true; }

	public empty = () => empty();
}
