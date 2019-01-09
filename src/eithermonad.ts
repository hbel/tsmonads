import {Monad, flatten} from "./helpers";
import {Just, Nothing, Maybe} from "./maybemonad";

/**
 * Create an Either with a left (errornous) value
 */
export function left<L, R>(value: L) {
    if (value ===  null || value === undefined) throw Error("Value must not be undefined or null!");
    return  new Either<L, R>(value, undefined);
}

/**
 * Create an Either with a right (correct) value
 */
export function right<L, R>(value: R) {
    if (value ===  null || value === undefined) throw Error("Value must not be undefined or null!");
    return  new Either<L, R>(undefined, value);
}

/**
 * Either monad
 */
export class Either<L, R> implements Monad<R> {
    private readonly _left?: L;
    private readonly _right?: R;

    constructor(left: L | undefined, right: R | undefined) {
        if ( left !== undefined && right !== undefined )
            throw new Error("Can only set left or right to a defined value!");
        this._left = left;
        this._right = right;
    }

    /**
     * Return the start value if the monad is nothing, and f() of the monad if it contains a value
     */
    reduce<V>(f: (total: V, current: R) => V, start: V): V {
        if (this.isLeft) return start;
        return f(start, this._right!);
    }

    /**
     * Map the contained value with the given function. Note that the type of the left value does not change!
     */
    map<V>(f: (x: R) => V): Either<L, V> {
        if ( this.isLeft ) return left<L, V>(this.left);
        return right<L, V>( f(this.right) );
    }

    /**
     * FlatMap the monad using the given function which in turn will return a monad. Note that the type of the left value does not change!
     */
    flatMap<V>(f: (x: R) => Either<L, V>): Either<L, V> {
        if ( this.isLeft ) return left<L, V>(this.left);
        return f(this.right);
    }

    /**
     * Whether the left holds a value
     */
    get isLeft() { return (this._right === null || this._right === undefined); }

    /**
     * Whether the right holds a value
     */
    get isRight() { return  (this._left === null || this._left === undefined); }

    /**
     * Return the left value. Will throw a runtime error if there is no left value
     */
    get left(): L {
        if ( this.isLeft )
            return this._left!;
        throw new Error("No left value");
    }

    /**
     * Return the right value. Will throw a runtime error if there is no right value
     */
    get right(): R {
        if ( this.isRight )
            return this._right!;
        throw new Error("No right value");
    }

    /**
     * Return the "right value"
     */
    unit<V>(x: V) {
        return right<L, V>(x);
    }

    /**
     * Call forEach on the right value
     */
    forEach(f: (x: R) => void ): void { if ( this.isRight ) f(this._right!); }

    unsafeLift = () => {
        if (this.isRight ) return this._right!;
        throw new Error("Is not a right value");
    }

    get hasValue() { return this.isRight; }

    /**
     * Convert to maybe
     */
    toMaybe = (): Maybe<R> => this.isRight ? new Just(this._right!) : new Nothing();

    /**
     * Turn an array of monads of T into a monad of array of T.
     */
    static flatten<L,R>(coll: Array<Either<L,R>> ): Either<Array<L>,Array<R>> {
        return flatten(coll) as Either<Array<L>,Array<R>>;
    }
}