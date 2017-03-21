export declare function left<L, R>(value: L): Either<L, R>;
export declare function right<L, R>(value: R): Either<L, R>;
export declare class Either<L, R> {
    _left: L;
    _right: R;
    constructor(left: L, right: R);
    map<V>(f: (x: R) => V): Either<L, V>;
    flatMap<V>(f: (x: R) => Either<L, V>): Either<L, V>;
    isLeft: () => boolean;
    isRight: () => boolean;
    left: () => L;
    right: () => R;
}
