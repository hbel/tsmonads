import {Monad} from "./helpers";

// Create an Either with a left (errornous) value
export function left<L, R>(value: L) {
    if (!value) throw Error("Value must not be undefined or null!");
    return  new Either<L, R>(value, undefined);
}

// Create an Either with a right (correct) value
export function right<L, R>(value: R) {
    if (!value) throw Error("Value must not be undefined or null!");
    return  new Either<L, R>(undefined, value);
}

// Either monad
export class Either<L, R> implements Monad<R> {
    private readonly _left: L;
    private readonly _right: R;

    constructor(left: L, right: R) {
        if ( left !== undefined && right !== undefined )
            throw new Error("Can only set left or right to a defined value!");
        this._left = left;
        this._right = right;
    }

    // Map the contained value with the given function. Note that the type of the left value does not change!
    map<V>(f: (x: R) => V): Either<L, V> {
        if ( this.isLeft() ) return left<L, V>(this.left());
        return right<L, V>( f(this.right()) );
    }

    // FlatMap the monad using the given function which in turn will return a monad. Note that the type of the left value does not change!
    flatMap<V>(f: (x: R) => Either<L, V>): Either<L, V> {
        if ( this.isLeft() ) return left<L, V>(this.left());
        return f(this.right());
    }

    // Whether the left holds a value
    isLeft = () => !this._right;

    // Whether the right holds a value
    isRight = () => !this._left;

    // Return the left value. Will throw a runtime error if there is no left value
    left: () => L =
        () => { if ( this.isLeft() ) return this._left; throw new Error("No left value"); };

    // Return the right value. Will throw a runtime error if there is no right value
    right: () => R =
        () => { if ( this.isRight() ) return this._right; throw new Error("No right value"); };

    unit<V>(x: V) {
        return right<L, V>(x);
    }
}