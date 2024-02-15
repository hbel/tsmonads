import { flatMap, flatten, is, map } from "../src/helpers";
import { call, clean, maybe, right } from "./../monads";
import * as Maybe from "./../src/maybemonad";
import * as Either from "./../src/eithermonad";
import * as Try from "./../src/trymonad";

describe("A maybe factory", () => {
    it("should return Just(5) for a value of 5", () => {
        const mb = Array<Maybe.Maybe<number>>(
            maybe<number>(null),
            maybe(4),
            maybe<number>(undefined),
            maybe(2),
            maybe<number>(null)
        );
        const cleaned = clean(mb);
        expect(cleaned.length).toBe(2);
        expect(cleaned[0]).toBe(4);
        expect(cleaned[1]).toBe(2);
    });
});

describe("Flatten", () => {
    it("should return nothing for an empty array encapsuled in an arbitrary monad", () => {
        expect(
            flatten<number, Maybe.Maybe<number>>([]).nothing
        ).not.toBeUndefined();
    });
    it("if empty is given, return the correct empty monad for empty arrays", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const a: any[] = [];
        expect(
            flatten<number, Try.Try<number>>(a, Try.empty).succeeded
        ).not.toBeUndefined();
        expect(
            flatten<number, Maybe.Maybe<number>>(a, Maybe.empty).nothing
        ).not.toBeUndefined();
        const either = flatten<number, Either.Either<never, number>>(
            a,
            Either.empty
        );
        expect(either.isLeft && either.value).not.toBeUndefined();
    });
    it("Should properly flatten a filled structure", () => {
        const tries: Array<Try.Try<number>> = [
            call(() => 1),
            call(() => 2),
            call(() => 3),
        ];
        expect(flatten(tries, Try.empty).succeeded).not.toBeUndefined();
        const maybes: Array<Maybe.Maybe<number>> = [
            maybe(1),
            maybe(2),
            maybe(3),
        ];
        expect(flatten(maybes, Maybe.empty).nothing).not.toBeUndefined();
        const eithers: Array<Either.Right<number>> = [
            right(1),
            right(2),
            right(3),
        ];
        const either = flatten(eithers, Either.empty);
        expect(either.isLeft && either.value).not.toBeUndefined();
    });
});

describe("Functional monads", () => {
    it("Should be able to use functional map", () => {
        const m1 = map((x: number) => 2 * x, maybe(5));
        expect(m1.hasValue).toBeTruthy();
        expect(m1.hasValue && m1.value).toBe(10);
        const m2 = map(
            (x: number) => 2 * x,
            call(() => 5)
        );
        expect(m2.hasValue).toBeTruthy();
        expect(m2.hasValue && m2.value).toBe(10);
        const m3 = map((x: number) => 2 * x, right(5));
        expect(m3.hasValue).toBeTruthy();
        expect(m3.hasValue && m3.value).toBe(10);
    });
    it("Should be able to use functional flatMap", () => {
        const fm1 = flatMap((x: number) => maybe(2 * x), maybe(5));
        expect(fm1.hasValue).toBeTruthy();
        expect(fm1.hasValue && fm1.value).toBe(10);
        const fm2 = flatMap(
            (x: number) => call(() => 2 * x),
            call(() => 5)
        );
        expect(fm2.hasValue).toBeTruthy();
        expect(fm2.hasValue && fm2.value).toBe(10);
        const fm3 = flatMap((x: number) => right(2 * x), right(5));
        expect(fm3.hasValue).toBeTruthy();
        expect(fm3.hasValue && fm3.value).toBe(10);
    });
    it("Should be able to use functional is", () => {
        expect(is((x: number) => x > 2, maybe(5))).toBeTruthy();
    });
});
