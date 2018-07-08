/**
 * Base interface for monads. Defines a unit operation and a flatMap operation,
 * which are needed in all monads
 */
export interface Monad<T> {
    unit<V>(value: V): any;
    map<V>(f: (x: T) => V ): Monad<V>;
    flatMap<V>(f: (x: T) => Monad<V> ): Monad<V>;
    forEach(f: (x: T) => void ): void;
    unsafeLift(): T;
    hasValue(): boolean;
}

// The flatten functions allows you to turn an array of monads of T into
// an monad of array of T.
export function flatten<T, U extends Monad<T>>( l: Array<U> ): any {
    if ( !l || l.length === 0 )
        return null;
    let unit = l[0].unit;
    function rec( l: Array<U>, r: Array<T> ): any {
        if ( l.length === 0 ) {
            return unit(r);
        }
        return l[0].flatMap( x => rec( l.slice(1), r.concat([x])) );
    }
    let empty: Array<T> = [];
    let ret = rec(l, empty);
    return ret;
}

// Remove all "empty" monads from an array of monads and lift the remaining values
export function clean<T, U extends Monad<T>>(coll: Array<U>): Array<T> {
    return coll.filter(elem => elem.hasValue()).map(elem => elem.unsafeLift());
}

// Run foreach on an array of monads
export function forEach<T, U extends Monad<T>>( coll: Array<U>, f: (x: T) => void ): void{
    coll.forEach( (y: Monad<T>) => y.forEach(f) );
};

// Run map for each element of an array of monads
export function map<T, S, U extends Monad<T>>( coll: Array<U>, f: (x: T) => S ): any {
    coll.map( (y: Monad<T>) => y.map(f) );
};