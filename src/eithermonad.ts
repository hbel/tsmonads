import { anyEquals, flatten, Monad } from "./helpers";
import { Just, Maybe, nothing, Nothing } from "./maybemonad";

/**
 * Create an Either with a left (erroneous) value
 */
export function left<L, R>(value: L) {
    if (value === null || value === undefined) {
        throw Error("Value must not be undefined or null!");
    }
    return new Either<L, R>(value, undefined);
}

/**
 * Create an Either with a right (correct) value
 */
export function right<L, R>(value: R) {
    if (value === null || value === undefined) {
        throw Error("Value must not be undefined or null!");
    }
    return new Either<L, R>(undefined, value);
}

/**
 * Either monad
 */
export class Either<L, R> implements Monad<R> {

    /**
     * Whether the left holds a value
     */
    get isLeft() { return (this._right === null || this._right === undefined); }

    /**
     * Whether the right holds a value
     */
    get isRight() { return (this._left === null || this._left === undefined); }

    /**
     * Return the left value. Will throw a runtime error if there is no left value
     */
    get left(): L {
        if (this.isLeft) {
            return this._left!;
        }
        throw new Error("No left value");
    }

    /**
     * Return the right value. Will throw a runtime error if there is no right value
     */
    get right(): R {
        if (this.isRight) {
            return this._right!;
        }
        throw new Error("No right value");
    }

    get hasValue() { return this.isRight; }

    /**
     * Turn an array of monads of T into a monad of array of T.
     */
    public static flatten<L, R>(coll: Array<Either<L, R>>): Either<L[], R[]> {
        return flatten(coll, Either.empty) as Either<L[], R[]>;
    }
    private readonly _left?: L;
    private readonly _right?: R;

    constructor(leftVal: L | undefined, rightVal: R | undefined) {
        if (leftVal !== undefined && rightVal !== undefined) {
            throw new Error("Can only set left or right to a defined value!");
        }
        this._left = leftVal;
        this._right = rightVal;
    }

    /**
     * Return the start value if the monad is nothing, and f() of the monad if it contains a value
     */
    public reduce<V>(f: (total: V, current: R) => V, start: V): V {
        if (this.isLeft) { return start; }
        return f(start, this._right!);
    }

    /**
     * Map the contained value with the given function. Note that the type of the left value does not change!
     */
    public map<V>(f: (x: R) => V): Either<L, V> {
        if (this.isLeft) { return left<L, V>(this.left); }
        return right<L, V>(f(this.right));
    }

    /**
     * FlatMap the monad using the given function which in turn will return a monad.
     * Note that the type of the left value does not change!
     */
    public flatMap<V>(f: (x: R) => Either<L, V>): Either<L, V> {
        if (this.isLeft) { return left<L, V>(this.left); }
        return f(this.right);
    }

    /**
     * Return the "right value"
     */
    public unit<V>(x: V) {
        return right<L, V>(x);
    }

    /**
     * Call forEach on the right value
     */
    public forEach(f: (x: R) => void): void { if (this.isRight) { f(this._right!); } }

    public unsafeLift = () => {
        if (this.isRight) { return this._right!; }
        throw new Error("Is not a right value");
    }

    /**
     * Convert to maybe
     */
    public toMaybe = (): Maybe<R> => this.isRight ? new Just(this._right!) : new Nothing();

	/**
     * Convert to promise
     */
	public toPromise = (): Promise<R> => this.isRight ? Promise.resolve(this._right!) : Promise.reject(this._left);

    /**
     * Check whether two Either instances are equal
     */
    public equals<U, V>(that: Either<U, V>): boolean {
        return anyEquals(this, that);
    }

	public static empty = <T>() => left<Nothing, T>(nothing());

	public empty = <T>() => Either.empty();

	public isEmpty (){ return this.isLeft; }
}
