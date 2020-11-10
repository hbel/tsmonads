import { flatMap, is, map } from "../src/helpers";
import {call, clean, maybe, Maybe, right} from "./../monads";

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

describe("Functional monads", () => {
    it("Should be able to use functional map", () => {
        expect(map((x: number) => 2 * x, maybe<number>(5)).hasValue).toBeTruthy();
        expect(map((x: number) => 2 * x, maybe<number>(5)).unsafeLift()).toBe(10);
        expect(map((x: number) => 2 * x, call<number>(() => 5)).hasValue).toBeTruthy();
        expect(map((x: number) => 2 * x, call<number>(() => 5)).unsafeLift()).toBe(10);
        expect(map((x: number) => 2 * x, right<number, number>(5)).hasValue).toBeTruthy();
        expect(map((x: number) => 2 * x, right<number, number>(5)).unsafeLift()).toBe(10);
    })
    it("Should be able to use functional flatMap", () => {
        expect(flatMap((x: number) => maybe(2 * x), maybe<number>(5)).hasValue).toBeTruthy();
        expect(flatMap((x: number) => maybe(2 * x), maybe<number>(5)).unsafeLift()).toBe(10);
        expect(flatMap((x: number) => call(() => 2 * x), call<number>(() => 5)).hasValue).toBeTruthy();
        expect(flatMap((x: number) => call(() => 2 * x), call<number>(() => 5)).unsafeLift()).toBe(10);
        expect(flatMap((x: number) => right(2 * x), right(5)).hasValue).toBeTruthy();
        expect(flatMap((x: number) => right(2 * x), right(5)).unsafeLift()).toBe(10);
    })
    it("Should be able to use functional is", () => {
        expect(is((x: number) => 2 < x, maybe<number>(5))).toBeTruthy();
    })
});
