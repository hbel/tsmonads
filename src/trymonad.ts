import { anyEquals, chain, flatten, Monad } from "./helpers";
import { Maybe, maybe, Nothing } from "./maybemonad";

/**
 * Tries to call the given function. Returns a Success if
 * no exception occurred, otherwise returns a Failure containing the error
 */
export function call<T>(f: () => T): Success<T> | Failure {
    try {
        const result = f();
        return Try.fromValue(result);
    }
    catch (ex) {
        return Try.fromError(ex);
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

/**
 *  Try monad
 */
export abstract class Try<T> implements Monad<T> {

    /**
     * Remove one monadic level from the given Argument
     */
    public static chain<T, U extends Try<Try<T>>>(monad: U): Success<T> | Failure {
        return chain(monad) as Success<T> | Failure;
    }

    /**
     * Turn an array of monads of T into a monad of array of T.
     */
    public static flatten<T>(coll: Array<Try<T>>): Success<T[]> | Failure {
        return flatten(coll, Try.empty) as Success<T[]> | Failure;
    }

	public static fromError<T, E extends Error>(error: E): Success<T> | Failure {
		return new Failure(error);
	}

	public static fromValue<T>(value: T): Success<T> | Failure {
		return new Success(value);
	}

    // Whether the call has succeeded without an exception
    public succeeded: true | false;

    /**
     *  Is this monad not "nothing"?
     */
    public hasValue: true | false;
    /**
     * Function that should be called if this is a Success
     */
    public abstract onSuccess(f: (x: T) => void): Success<T> | Failure;

    /**
     * Function to be called if this is a Failure
     */
    public abstract onFailure(f: (error: Error) => void): Success<T> | Failure;

    /**
     * Map the result using another function
     */
    public abstract map<U>(f: (x: T) => U): Success<U> | Failure;

    /**
     * Flat map the result
     */
    public abstract flatMap<U>(f: (x: T) => Success<U> | Failure): Success<U> | Failure;

    /**
     * Run forEach on the monad. Will be executed only if the monad
     * contains a value.
     */
    public abstract forEach(f: (x: T) => void): void;

    /**
     * Convert try into a maybe
     */
    public abstract toMaybe(): Maybe<T>;

    public abstract unit<V>(x: V): Success<V> | Failure;

    /**
     * Return the start value if the monad is nothing, and f() of the monad if it contains a value
     */
    public abstract reduce<V>(f: (total: V, current: T) => V, start: V): V;

    /**
     * Check whether two Try instances are equal
     * @param that
     */
    public abstract equals<U>(that: Success<U> | Failure): boolean;

	/**
     * Convert to promise
     */
	public abstract toPromise(): Promise<T>;

	public static empty = () => new Failure(new Error());

	public abstract isEmpty(): boolean;
}

export class Success<T> implements Try<T> {
    constructor(public readonly value: T) { }

    public onSuccess(f: (x: T) => void): this | Failure { f(this.value); return this; }

    public onFailure(_: (error: Error) => void): this | Failure { return this; }

    public reduce<V>(f: (total: V, current: T) => V, start: V): V { return f(start, this.value); }

    public readonly succeeded = true;

    public get result(): T { return this.value; }

	public map<U>(f: (x: T) => U): Success<U> | Failure {
        return call<U>(() => f(this.value));
    }

    public flatMap<U>(f: (x: T) => Success<U> | Failure): Success<U> | Failure {
        return f(this.value);
    }

    public unit<V>(x: V): Success<V> | Failure {
        return call(() => x);
    }

    public forEach = (f: (x: T) => void): void => f(this.value);

    public readonly hasValue = true;

    public toMaybe = () => maybe(this.value);

    public equals<U>(that: Success<U> | Failure): boolean {
        return anyEquals(this, that);
    }

	public toPromise(): Promise<T> { return Promise.resolve(this.value) }

	public isEmpty() { return false; }

	public empty = () => Try.empty();
}

export class Failure implements Try<never> {
    constructor(private readonly _error: Error) { }

    public onSuccess(_f: (x: never) => void): Success<never> | this { return this; }

    public onFailure(f: (error: Error) => void): Success<never> | this { f(this._error); return this; }

    public reduce<V>(_: (total: V, current: never) => V, start: V): V { return start; }

    public readonly succeeded = false;

    public get error(): Error { return this._error; }

    public map<U>(_f: (x: never) => U): Success<U> | this {
        return this;
    }

    public flatMap<U>(_f: (x: never) => Success<U> | this): Success<U> | this {
        return this;
    }

    public unit<V>(x: V): Success<V> | Failure {
        return call(() => x);
    }

    // tslint:disable-next-line:no-empty
    public forEach(_f: (x: never) => void): void { return; }

    public readonly hasValue = false;

    public toMaybe = () => new Nothing();

    public equals<U>(that: Success<U> | Failure): boolean {
        return anyEquals(this, that);
    }

	public toPromise(): Promise<never> { return Promise.reject(this._error); }

	public isEmpty() { return true; }

	public empty = () => Try.empty();
}
