import {Monad, flatten, chain} from "./helpers";

export const nothing = () => new Nothing();

// Factory function for maybes. Depending on the argument will return a Just<T> or Nothing
export function maybe<T>(val: T | undefined | null): Maybe<T> {
    if (val === null || val === undefined)
        return new Nothing();
    else
        return new Just<T>(val);
}

/**
 * Maybe monad.
 */
export abstract class Maybe<T> implements Monad<T> {
    /**
     * Map the contained value with the given function
     */
    abstract map<U>(f: (x: T) => U): Maybe<U>;

    /**
     * FlatMap the monad using the given function which in turn will return a monad
     */
    abstract flatMap<U>(f: (x: T) => Maybe<U>): Maybe<U>;

    /**
     * Safe way to extract the value from the monad. If it contains
     * a value, return it, otherwise return the given default value
     */
    abstract orElse(def: T): T;

    /**
     * Return the value from the monad or undefined if it is Nothing.
     */
    abstract orUndefined(): T | undefined;

    /**
     *  Lift the monad to get its value. Note that this will cause
     *  a runtime error if the monad is Nothing!
     * */
    abstract unsafeLift(): T;

    /**
     *  Is this monad "nothing"?
     */
    nothing: boolean;

    /**
     *  Is this monad not "nothing"?
     */
    abstract hasValue(): boolean;

    /**
     * Match the monad by executing a specific funtions if it holds a value,
     * and another function if not
     */
    abstract match<U>( just: (x: T) => U, nothing: () => U ): U;
    
    /**
     * Run forEach on the monad. Will be executed only if the monad 
     * contains a value.
     */
    abstract forEach(f: (x: T) => void ): void;

    abstract unit<V>(x: V): Maybe<V>;

    /**
     * Remove one monadic level from the given Argument
     */
    static chain<T, U extends Maybe<Maybe<T>>>(monad: U): Maybe<T> {
        return chain(monad) as Maybe<T>;
    }

    /**
     * Turn an array of monads of T into a monad of array of T.
     */
    static flatten<T>(coll: Array<Maybe<T>> ): Maybe<Array<T>> {
        return flatten(coll) as Maybe<Array<T>>;
    }
}

/**
 * Just class. If a maybe monad contains a value, it will be hold here.
 */
export class Just<T> implements Maybe<T> {
    constructor(private readonly _value: T) {
        if (this._value === undefined || this._value === null)
            throw new Error("Value must be not null and not undefined");
    }

    map<U>(f: (x: T) => U): Maybe<U> {
        return new Just<U>(f(this._value));
    }

    flatMap<U>(f: (x: T) => Maybe<U>): Maybe<U> {
        return f(this._value);
    }

    orElse(def: T): T {
        return this._value;
    }

    orUndefined(): T | undefined {
        return this._value;
    }

    unsafeLift(): T {
        return this._value;
    }

    get nothing(): boolean { return false; };
    hasValue(): boolean { return true; };

    unit = maybe;

    match<U>( just: (x: T) => U, nothing: () => U ): U { return just(this._value); }

    forEach(f: (x: T) => void ): void { f(this._value); }
}

/** 
 * Nothing class. If a maybe monad contains no value, it will be of this type.
 */
export class Nothing implements Maybe<any> {

    map<T, U>(f: (x: T) => U): Maybe<U> {
        return nothing();
    }

    flatMap<T, U>(f: (x: T) => Maybe<U>): Maybe<U> {
        return nothing();
    }

    orElse<T>(def: T): T {
        return def;
    }

    orUndefined(): undefined {
        return undefined;
    }

    unsafeLift<T>(): T {
        throw new Error("Nothing contains no value");
    }

    get nothing(): boolean { return true; }
    hasValue(): boolean { return false; }

    unit = maybe;

    match<U>( just: (x: any) => U, nothing: () => U ): U { return nothing(); }

    forEach(f: (x: any) => void ): void {}
}
