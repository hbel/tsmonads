import {flatten, maybe} from "./../src/monads";

const jasmine = require("jasmine");

describe ("A maybe factory", () => {
    it("should return Just(5) for a value of 5", () => {
        const m = maybe(5);
        expect(m.nothing()).toBe(false);
        expect(m.orElse(0)).toBe(5);
        expect(m.unsafeLift()).toBe(5);
    });
    it("should return Nothing for a value of null", () => {
        const m = maybe(null);
        expect(m.nothing()).toBe(true);
        expect(m.orElse(0)).toBe(0);
    });
});

describe ("A Maybe", () => {
    it("should throw an exception on lifting a nothing", () => {
        const m = maybe(null);
        expect(m.unsafeLift).toThrow(new Error("Nothing contains no value"));
    });
    it("should map to new monads correctly for correct result", () => {
        const m = maybe(5).map( x => 2 * x).flatMap( y => maybe(y / 2));
        expect(m.nothing()).toBe(false);
        expect(m.orElse(0)).toBe(5);
        expect(m.unsafeLift()).toBe(5);
    });
    it("should map to new monads correctly for Nothing", () => {
        const m = maybe(null).map( x => 2 * x).flatMap( y => maybe(y / 2));
        expect(m.nothing()).toBe(true);
        expect(m.orElse(0)).toBe(0);
    });
    it("should allow combining wrapped values into new, composited ones", () => {
        const m = maybe(1);
        const n = maybe(2);
        // combine m,m into a Maybe<[number,number]>. Just creating a new tuple
        // would give as a [Maybe<number>,Maybe<number>] what is obviously not what we want
        let tuple = m.flatMap( x => n.flatMap( y => maybe([x, y])) );
        expect(tuple.nothing()).toBe(false);
        let [x, y] = tuple.orElse([0, 0]);
        expect(x).toBe(1);
        expect(y).toBe(2);

        // We can also do this using the flatten() helper function:


        let mbList = [1, 2, 3, 4].map(x => maybe(x)); // Array of Maybe<number>
        // Turn this into a Maybe[Array<number>]

        let mbArray = flatten(mbList);
        expect(mbArray.nothing()).toBe(false);
        let normalArray = mbArray.orElse([]);
        expect(normalArray.length).toBe(4);
        expect(normalArray[0]).toBe(1);
        expect(normalArray[2]).toBe(3);
    });
});

