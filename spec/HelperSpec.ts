import {clean, maybe, Maybe} from "./../monads";

const jasmine = require("jasmine");

describe ("A maybe factory", () => {
    it("should return Just(5) for a value of 5", () => {
        const mb = Array<Maybe<number>>(maybe(null),maybe(4),maybe(undefined),maybe(2),maybe(null));
        const cleaned = clean(mb);
        expect(cleaned.length).toBe(2);
        expect(cleaned[0]).toBe(4);
        expect(cleaned[1]).toBe(2);
    });
})
