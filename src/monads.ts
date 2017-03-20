export namespace Monads {

// Factory function for maybes. Depending on the argument will return a Just<T> or Nothing
export function maybe<T>(val: T): Maybe<T> {
    if ( !val )
        return new Nothing();
    else
        return new Just<T>(val);
}

// Maybe monad.
export interface Maybe<T> {
    // Map the contained value with the given function
    map<U>(f: (x: T) => U): Maybe<U>;

    // FlatMap the monad using the given function which in turn will return a monad
    flatMap<U>(f: (x: T) => Maybe<U>): Maybe<U>;

    // Safe way to extract the value from the monad. If it contains
    // a value, return it, otherwise return the given default value
    orElse(def: T): T;

    // Lift the monad to get its value. Note that this will cause
    // a runtime error if the monad is Nothing!
    unsafeLift(): T;

    // Is this monad "nothing"?
    nothing(): boolean;
}

// Just class. If a maybe monad contains a value, it will be hold here.
class Just<T> implements Maybe<T> {

    private value: T;

    constructor(val: T) {
        if (!val)
            throw new Error("Value must be not null and not undefined");
        this.value = val;
    }

    map<U>(f: (x: T) => U): Maybe<U> {
        return new Just<U>(f(this.value));
    }

    flatMap<U>(f: (x: T) => Maybe<U>): Maybe<U> {
        return f(this.value);
    }

    orElse(def: T): T {
        return this.value;
    }

    unsafeLift(): T {
        return this.value;
    }

    nothing(): boolean { return false; };
}

// Nothing class. If a maybe monad contains no value, it will be of this type.
class Nothing implements Maybe<any> {

    map<T, U>(f: (x: T) => U): Maybe<U> {
        return new Nothing();
    }

    flatMap<T, U>(f: (x: T) => Maybe<U>): Maybe<U> {
        return new Nothing();
    }

    orElse<T>(def: T): T {
        return def;
    }

    unsafeLift<T>(): T {
        throw new Error("Nothing contains no value");
    }

    nothing(): boolean { return true; };
}

}