import { anyEquals, flatten as flattenHelper, Monad } from "./helpers";
import { Just, Maybe, nothing, Nothing } from "./maybemonad";

/**
 * Create an Either with a left (erroneous) value
 */
export function left<L>(value: L) {
    if (value === null || value === undefined) {
        throw Error("Value must not be undefined or null!");
    }
    return new Left<L>(value);
}

/**
 * Create an Either with a right (correct) value
 */
export function right<R>(value: R) {
    if (value === null || value === undefined) {
        throw Error("Value must not be undefined or null!");
    }
    return new Right<R>(value);
}

export type Either<L,R> = Left<L> | Right<R>

/**
     * Turn an array of monads of T into a monad of array of T.
     */
export function flatten<L, R>(coll: Array<Either<L, R>>): Either<L[], R[]>{
	return flattenHelper<R, Either<L,R>>(coll, empty) as Either<L[],R[]>;
}

export const empty = () => left<Nothing>(nothing());

/**
 * Either monad
 */
export abstract class EitherBase<L, R> implements Monad<R> {

    /**
     * Whether the left holds a value
     */
    abstract isLeft: boolean;

    /**
     * Whether the right holds a value
     */
    abstract isRight: boolean;

    abstract hasValue: boolean;

    /**
     * Return the start value if the monad is nothing, and f() of the monad if it contains a value
     */
    abstract reduce<V>(f: (total: V, current: R) => V, start: V): V;

    /**
     * Map the contained value with the given function. Note that the type of the left value does not change!
     */
    abstract map<V>(f: (x: R) => V): Either<L,V>;

    /**
     * FlatMap the monad using the given function which in turn will return a monad.
     * Note that the type of the left value does not change!
     */
    abstract flatMap<V>(f: (x: R) => Either<L,V>): Either<L,V>;

    /**
     * Return the "right value"
     */
    public unit<V>(x: V) {
        return right<V>(x);
    }

    /**
     * Call forEach on the right value
     */
    abstract forEach(f: (x: R) => void): void;

    /**
     * Convert to maybe
     */
    abstract toMaybe(): Maybe<R>;

	/**
     * Convert to promise
     */
	abstract toPromise(): Promise<R>;

    /**
     * Check whether two Either instances are equal
     */
    public equals<U, V>(that: Left<U> | Right<V>): boolean {
        return anyEquals(this, that);
    }

	public empty = <T>() => empty();

	public isEmpty (){ return this.isLeft; }
}

export class Left<L> extends EitherBase<L, never> {
	public constructor(public readonly left: L) { super(); }

	public readonly isLeft = true;
	public readonly isRight = false;
	public readonly hasValue = false;

	public map<V>(f: (x: never) => V): Either<L,V> {
		return this;
	}

	public flatMap<V>(f: (x: never) => Left<L> | Right<never>): Either<L,never> {
		return this;
	};

	public reduce<V>(f: (total: V, current: never) => V, start: V): V {
        return start;
    }

	public forEach(f: (x: never) => void): void { /**/ }

	public toMaybe = (): Maybe<never> => new Nothing();
	
	public toPromise = (): Promise<never> => Promise.reject(this.left);
	
}

export class Right<R> extends EitherBase<never, R> {
	constructor(public readonly value: R) { super(); }

	public readonly isLeft = false;
	public readonly isRight = true;
	public readonly hasValue = true;

	public reduce<V>(f: (total: V, current: R) => V, start: V): V {
        return f(start, this.value);
    }

	public map<V>(f: (x: R) => V): Either<never,V> {
		return right(f(this.value));
	};

	public flatMap<V>(f: (x: R) => Either<never,V>): Either<never,V> {
		return f(this.value);
	};

	public forEach(f: (x: R) => void): void { f(this.value); }

	public toMaybe = (): Maybe<R> => new Just(this.value);
	
	public toPromise = (): Promise<R> => Promise.resolve(this.value);
	
}
