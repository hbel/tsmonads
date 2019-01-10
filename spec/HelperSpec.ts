import {clean, maybe, Maybe} from "./../monads";

describe ("A maybe factory", () => {
    it("should return Just(5) for a value of 5", () => {
        const mb = Array<Maybe<number>>(maybe<number>(null),
            maybe(4), maybe<number>(undefined), maybe(2), maybe<number>(null));
        const cleaned = clean(mb);
        expect(cleaned.length).toBe(2);
        expect(cleaned[0]).toBe(4);
        expect(cleaned[1]).toBe(2);
    });
});
