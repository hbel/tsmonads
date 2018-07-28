import {Monad, flatten} from "./helpers";
import {Maybe, maybe, Nothing} from "./maybemonad";

/**
 * Tries to call the given function. Returns a Success if
 * no exception occured, otherwise returns a Failure containing the error
 */
export function call<T>( f: () => T ): Try<T> {
    try {
        const result = f();
        return new Success(result);
    }
    catch (ex) {
        return new Failure(ex);
    }
}

/**
 *  Try monad
 */
export abstract class Try<T> implements Monad<T> {
    /**
     * Function that should be called if this is a Success
     */
    abstract onSuccess( f: (x: T) => void ): Try<T>;

    /**
     * Function to be called if this is a Failure
     */
    abstract onFailure( f: (error: Error) => void ): Try<T>;

    // Whether the call has succceeded without an exception
    succeeded: boolean;

    /**
     * The calls result (if no exception occured). Calling this
     * will throw a runtime error if an exception occured.
     */
    result: T;

    /**
     * The error (if an exception occured). Calling this
     * will throw a runtime error if no exception occured.
     */
    error: Error;

    /**
     * Map the result using another function
     */
    abstract map<U>( f: (x: T) => U ): Try<U>;

    /**
     * Flat map the result
     */
    abstract flatMap<U>( f: (x: T) => Try<U> ): Try<U>;

    /**
     * Run forEach on the monad. Will be executed only if the monad 
     * contains a value.
     */
    abstract forEach(f: (x: T) => void ): void;

    /**
     *  Lift the monad to get its value. Note that this will cause
     *  a runtime error if the monad is Nothing!
     * */
    abstract unsafeLift(): T;

    /**
     *  Is this monad not "nothing"?
     */
    abstract hasValue(): boolean;

    /**
     * Convert try into a maybe
     */
    abstract toMaybe(): Maybe<T>;

    abstract unit<V>(x: V): Try<V>;

    static flatten<T>(coll: Array<Try<T>> ): Try<Array<T>> {
        return flatten(coll) as Try<Array<T>>;
    }
}

export class Success<T> implements Try<T> {
    constructor(private readonly _value: T) {}
    onSuccess( f: (x: T) => void ): Try<T> { f(this._value); return this; }
    onFailure( f: (error: Error) => void ): Try<T> { return this; }
    get succeeded(): boolean { return true; }
    get result(): T { return this._value; }
    get error(): Error { throw new Error("No error occured"); }
    map<U>( f: (x: T) => U ): Try<U> {
        return call<U>( () => { return f(this._value); } );
    }
    flatMap<U>( f: (x: T) => Try<U> ): Try<U> {
        return f(this._value);
    }
    unit<V>(x: V): Try<V> {
        return call( () => { return x; } );
    }
    forEach = (f: (x: T) => void ): void => f(this._value);
    unsafeLift = (): T =>  this._value;
    hasValue = () => true;
    toMaybe = () => maybe(this._value);
}

export class Failure implements Try<any> {
    constructor(private readonly _error: Error) {}
    onSuccess( f: (x: any) => void ): Try<any> { return this; }
    onFailure( f: (error: Error) => void ): Try<any> { f(this._error); return this; }
    get succeeded(): boolean { return false; }
    get result(): any { throw new Error("Try resulted in an error!"); }
    get error(): Error { return this._error; }
    map<T, U>( f: (x: T) => U ): Try<U> {
        return this;
    }
    flatMap<T, U>( f: (x: T) => Try<U> ): Try<U> {
        return this;
    }
    unit<V>(x: V): Try<V> {
        return call( () => { return x; } );
    }
    forEach(f: (x: any) => void ): void {}
    unsafeLift<T>(): T {
        throw new Error("Is a failure");
    }
    hasValue = () => false;
    toMaybe = () => new Nothing();
}
