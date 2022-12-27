import { anyEquals, chain, flatten, Monad } from "./helpers";
import { Maybe, maybe, Nothing } from "./maybemonad";

/**
 * Tries to call the given function. Returns a Success if
 * no exception occurred, otherwise returns a Failure containing the error
 */
export function call<T>(f: () => T): Try<T> {
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
export function wrapPromise<T>(p: () => Promise<T>): Promise<Try<T>> {
	return p().then(s => new Success(s)).catch(e => new Failure(e));
}

/**
 *  Try monad
 */
export abstract class Try<T> implements Monad<T> {

    /**
     * Remove one monadic level from the given Argument
     */
    public static chain<T, U extends Try<Try<T>>>(monad: U): Try<T> {
        return chain(monad) as Try<T>;
    }

    /**
     * Turn an array of monads of T into a monad of array of T.
     */
    public static flatten<T>(coll: Array<Try<T>>): Try<T[]> {
        return flatten(coll, Try.empty) as Try<T[]>;
    }

	public static fromError<T, E extends Error>(error: E): Try<T> {
		return new Failure(error);
	}

	public static fromValue<T>(value: T): Try<T> {
		return new Success(value);
	}

    // Whether the call has succeeded without an exception
    public succeeded: boolean;

    /**
     * The calls result (if no exception occurred). Calling this
     * will throw a runtime error if an exception occurred.
     */
    public result: T;

    /**
     * The error (if an exception occurred). Calling this
     * will throw a runtime error if no exception occurred.
     */
    public error: Error;

    /**
     *  Is this monad not "nothing"?
     */
    public hasValue: boolean;
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
     *  Lift the monad to get its value. Note that this will cause
     *  a runtime error if the monad is Nothing!
     */
    public abstract unsafeLift(): T;

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

	public static empty = () => new Failure(new Error());

	public abstract isEmpty(): boolean;
}

export class Success<T> implements Try<T> {
    constructor(private readonly _value: T) { }

    public onSuccess(f: (x: T) => void): Try<T> { f(this._value); return this; }

    public onFailure(_: (error: Error) => void): Try<T> { return this; }

    public reduce<V>(f: (total: V, current: T) => V, start: V): V { return f(start, this._value); }

    public get succeeded(): boolean { return true; }

    public get result(): T { return this._value; }

    public get error(): Error { throw new Error("No error occurred"); }

    public map<U>(f: (x: T) => U): Try<U> {
        return call<U>(() => f(this._value));
    }

    public flatMap<U>(f: (x: T) => Try<U>): Try<U> {
        return f(this._value);
    }

    public unit<V>(x: V): Try<V> {
        return call(() => x);
    }

    public forEach = (f: (x: T) => void): void => f(this._value);

    public unsafeLift = (): T => this._value;

    public get hasValue() {
        return true;
    }

    public toMaybe = () => maybe(this._value);

    public equals<U>(that: Try<U>): boolean {
        return anyEquals(this, that);
    }

	public toPromise(): Promise<T> { return Promise.resolve(this._value) }

	public isEmpty() { return false; }

	public empty = () => Try.empty();
}

export class Failure implements Try<any> {
    constructor(private readonly _error: Error) { }

    public onSuccess(_f: (x: any) => void): Try<any> { return this; }

    public onFailure(f: (error: Error) => void): Try<any> { f(this._error); return this; }

    public reduce<V>(_: (total: V, current: any) => V, start: V): V { return start; }

    public get succeeded(): boolean { return false; }

    public get result(): any { throw new Error("Try resulted in an error!"); }

    public get error(): Error { return this._error; }

    public map<T, U>(_f: (x: T) => U): Try<U> {
        return this;
    }

    public flatMap<T, U>(_f: (x: T) => Try<U>): Try<U> {
        return this;
    }

    public unit<V>(x: V): Try<V> {
        return call(() => x);
    }

    // tslint:disable-next-line:no-empty
    public forEach(_f: (x: any) => void): void { return; }

    public unsafeLift<T>(): T {
        throw new Error("Is a failure");
    }

    public get hasValue() {
        return false;
    }

    public toMaybe = () => new Nothing();

    public equals<U>(that: Try<U>): boolean {
        return anyEquals(this, that);
    }

	public toPromise(): Promise<any> { return Promise.reject(this._error); }

	public isEmpty() { return true; }

	public empty = () => Try.empty();
}
