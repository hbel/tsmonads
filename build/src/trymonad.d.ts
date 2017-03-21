export declare function call<T>(f: () => T): Try<T>;
export interface Try<T> {
    onSuccess(f: (x: T) => void): Try<T>;
    onFailure(f: (error: Error) => void): Try<T>;
    succeeded(): boolean;
    result(): T;
    error(): Error;
    map<U>(f: (x: T) => U): Try<U>;
    flatMap<U>(f: (x: T) => Try<U>): Try<U>;
}
