// Base interface for monads. Defines a unit operation and a flatMap operation,
// which are needed in all monads
export interface Monad<T> {
    unit<V>(value: V): any;
    flatMap<V>(f: (x: T) => Monad<V> ): Monad<V>;
}

// The flatten functions allows you to turn an array of monads of T into
// an monad of array of T.
export function flatten<T, U extends Monad<T>>( l: Array<U> ): any {
    let unit = l[0].unit;
    function rec( l: Array<U>, r: Array<T> ): any {
        if ( l.length === 0 ) {
            return unit(r);
        }
        return l[0].flatMap( x => rec( l.slice(1), r.concat([x])) );
    }
    let ret = rec(l, []);
    return ret;
}