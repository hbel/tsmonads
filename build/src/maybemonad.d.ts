export declare function maybe<T>(val: T): Maybe<T>;
export interface Maybe<T> {
    map<U>(f: (x: T) => U): Maybe<U>;
    flatMap<U>(f: (x: T) => Maybe<U>): Maybe<U>;
    orElse(def: T): T;
    unsafeLift(): T;
    nothing(): boolean;
}
