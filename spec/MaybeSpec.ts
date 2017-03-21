import {maybe} from "./../monads";

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
});