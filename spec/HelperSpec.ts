import { flatMap, flatten, is, map } from "../src/helpers";
import {call, clean, Either, maybe, Maybe, right, Try} from "./../monads";

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


describe("Flatten", () => {
	it("should return nothing for an empty array encapsuled in an arbitrary monad", () => {
		const a: any[] = [];
		expect((flatten<any, Maybe<any>>(a) as Maybe<any>).nothing).not.toBeUndefined;
	})
	it("if empty is given, return the correct empty monad for empty arrays", () => {
		const a: any[] = [];
		expect((flatten(a, Try.empty) as Try<any>).succeeded).not.toBeUndefined;
		expect((flatten(a, Maybe.empty) as Maybe<any>).nothing).not.toBeUndefined;
		expect((flatten(a, Either.empty) as Either<any, any>).left).not.toBeUndefined;
	})
})

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
