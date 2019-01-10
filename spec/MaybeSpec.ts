import { nothing } from "../src/maybemonad";
import {flatten, forEach, maybe, Maybe} from "./../monads";

describe ("A maybe factory", () => {
    it("should return Just(5) for a value of 5", () => {
        const m = maybe(5);
        expect(m.nothing).toBe(false);
        expect(m.orElse(0)).toBe(5);
        expect(m.unsafeLift()).toBe(5);
    });
    it("should return Nothing for a value of null", () => {
        const m = maybe<number>(null);
        expect(m.nothing).toBe(true);
        expect(m.orElse(0)).toBe(0);
    });
});

describe ("nothing()", () => {
    it("should set a maybe of arbitrary type to nothing", () => {
        const m: Maybe<number> = nothing();
        expect(m.nothing).toBe(true);
        expect(m.orElse(0)).toBe(0);
    });
});

describe ("Maybe.match", () => {
    it("should run a matcher function depending on it's contents", () => {
        const u = maybe(5).match((x) => x + 1, () => 0);
        expect(u).toBe(6);
        const v = maybe<number>(null).match((x) => x + 1, () => 0);
        expect(v).toBe(0);
    });
});

describe ("Maybe.reduce", () => {
    it("should return a value in", () => {
        const u = maybe({test: "test"}).reduce((_, t) => t.test, "");
        expect(u).toBe("test");
        const v = nothing().reduce((_, t) => t.test, "dummy");
        expect(v).toBe("dummy");
    });
});

describe ("Maybe.foreach", () => {
    it("will run a function only if the monad holds a value", () => {
        let x = 1;
        maybe(5).forEach((y) => x = x + y);
        expect(x).toBe(6);
        maybe<number>(null).forEach((y) => x = x + y);
        expect(x).toBe(6);
    });
});

describe("On a collection of Maybes", () => {
    it("foreach's parameter should be executed on each element that holds a value", () => {
        let mbList: Array<Maybe<number>> = [1, 2, 3, 4].map((k) => maybe(k)); // Array of Maybe<number>
        let x = 0;
        forEach(mbList, (y: number) => x = x + y);
        expect(x).toBe(10);
        mbList = [null, 2, null, 4].map((xx) => maybe(xx)); // Array of Maybe<number>
        x = 0;
        forEach<number, Maybe<number>>(mbList, (y) => x = x + y);
        expect(x).toBe(6);
    });
});

describe("A maybe of a maybe", () => {
    it("can be chained into a maybe", () => {
        const m = maybe(maybe(5));
        expect(Maybe.chain(m).orUndefined()).toBe(5);
    });
});

describe("Maybe.if", () => {
    it("returns true", () => {
        const m: boolean = maybe(5).is((x) => x < 6);
        expect(m).toBeTruthy();
    });
    it("returns false", () => {
        const m: boolean = maybe(5).is((x) => x > 6);
        expect(m).toBeFalsy();
        expect(nothing().is((x) => x > 5)).toBeFalsy();
    });
});

describe ("A Maybe", () => {
    it("should throw an exception on lifting a nothing", () => {
        const m = maybe(null);
        expect(m.unsafeLift).toThrow(new Error("Nothing contains no value"));
    });
    it("should also work when encapsulating a boolean", () => {
        const m = maybe(true);
        expect(m.hasValue).toBe(true);
        const n = maybe(false);
        expect(m.hasValue).toBe(true);
        expect(m.nothing).toBe(false);
    });
    it("should map to new monads correctly for correct result", () => {
        const m = maybe(5).map((x) => 2 * x).flatMap((y) => maybe(y / 2));
        expect(m.nothing).toBe(false);
        expect(m.orElse(0)).toBe(5);
        expect(m.unsafeLift()).toBe(5);
    });
    it("should map to new monads correctly for Nothing", () => {
        const m = maybe<number>(null).map((x) => 2 * x).flatMap((y) => maybe(y / 2));
        expect(m.nothing).toBe(true);
        expect(m.orElse(0)).toBe(0);
    });
    it("should allow combining wrapped values into new, composited ones", () => {
        const m = maybe(1);
        const n = maybe(2);
        // combine m,m into a Maybe<[number,number]>. Just creating a new tuple
        // would give as a [Maybe<number>,Maybe<number>] what is obviously not what we want
        const tuple = m.flatMap((xx) => n.flatMap((yy) => maybe([xx, yy])));
        expect(tuple.nothing).toBe(false);
        const [x, y] = tuple.orElse([0, 0]);
        expect(x).toBe(1);
        expect(y).toBe(2);

        // We can also do this using the flatten() helper function:

        const mbList = [1, 2, 3, 4].map((xx) => maybe(xx)); // Array of Maybe<number>
        // Turn this into a Maybe[Array<number>]
        const mbArray = flatten(mbList) as Maybe<number[]>;
        expect(mbArray.nothing).toBe(false);
        const normalArray = mbArray.orElse([]);
        expect(normalArray.length).toBe(4);
        expect(normalArray[0]).toBe(1);
        expect(normalArray[2]).toBe(3);
        const mbArray2 = Maybe.flatten(mbList);
        expect(mbArray2.nothing).toBe(false);
    });
    it("Flattening an empty array of Maybes should result in an empty Maybe<Array>", () => {
        const arr: Array<Maybe<number>> = [];
        const flattened = flatten(arr);
        expect(flattened.hasValue).toBe(false);
    });
    it("should be a value for Just and undefined when using orUndefined()", () => {
        const m = maybe(5);
        const n = nothing();
        expect(m.orUndefined()).toBe(5);
        expect(n.orUndefined()).toBe(undefined);
    });
});
