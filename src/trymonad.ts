import {Monad} from "./helpers";

// Tries to call the given function. Returns a Success if
// no exception occured, otherwise returns a Failure containing the error
export function call<T>( f: () => T ): Try<T> {
    try {
        const result = f();
        return new Success(result);
    }
    catch (ex) {
        return new Failure(ex);
    }
}

// Try monad
export interface Try<T> extends Monad<T> {
    // Function that should be called if this is a Success
    onSuccess( f: (x: T) => void ): Try<T>;

    // Function to be called if this is a Failure
    onFailure( f: (error: Error) => void ): Try<T>;

    // Whether the call has succceeded without an exception
    succeeded(): boolean;

    // The calls result (if no exception occured). Calling this
    // will throw a runtime error if an exception occured.
    result(): T;

    // The error (if an exception occured). Calling this
    // will throw a runtime error if no exception occured.
    error(): Error;

    // Map the result using another function
    map<U>( f: (x: T) => U ): Try<U>;

    // Flat map the result
    flatMap<U>( f: (x: T) => Try<U> ): Try<U>;
}

class Success<T> implements Try<T> {
    constructor(private readonly _value: T) {}
    onSuccess( f: (x: T) => void ): Try<T> { f(this._value); return this; }
    onFailure( f: (error: Error) => void ): Try<T> { return this; }
    succeeded(): boolean { return true; }
    result(): T { return this._value; }
    error(): Error { throw new Error("No error occured"); }
    map<U>( f: (x: T) => U ): Try<U> {
        return call<U>( () => { return f(this._value); } );
    }
    flatMap<U>( f: (x: T) => Try<U> ): Try<U> {
        return f(this._value);
    }
    unit<V>(x: V): Try<V> {
        return call( () => { return x; } );
    }
}

class Failure implements Try<any> {
    constructor(private readonly _error: Error) {}
    onSuccess( f: (x: any) => void ): Try<any> { return this; }
    onFailure( f: (error: Error) => void ): Try<any> { f(this._error); return this; }
    succeeded(): boolean { return false; }
    result(): any { throw new Error("Try resulted in an error!"); }
    error(): Error { return this._error; }
    map<T, U>( f: (x: T) => U ): Try<U> {
        return this;
    }
    flatMap<T, U>( f: (x: T) => Try<U> ): Try<U> {
        return this;
    }
    unit<V>(x: V): Try<V> {
        return call( () => { return x; } );
    }
}
