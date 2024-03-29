import { empty, flatten } from "../src/eithermonad";
import { type Either, left, right } from "./../monads";

describe("A left value", () => {
    it("should return an Either that has a left and no right value", () => {
        const m = left(5);
        expect(m.isLeft).toBe(true);
        expect(m.isRight).toBe(false);
        expect(m.value).toBe(5);
    });
    it("should be mappable using map and flatmap", () => {
        const m = left<number>(5);
        const mapped = m.map((x: number) => x + 2);
        expect(!mapped.hasValue && mapped.value).toBe(5);
    });
});

describe("A right value", () => {
    it("should return an Either that has a right and no left value", () => {
        const m = right(5);
        expect(m.isRight).toBe(true);
        expect(m.isLeft).toBe(false);
        expect(m.value).toBe(5);
    });
    it("should be mappable using map and flatmap", () => {
        const m = right(5);
        const mapped1 = m.map((x: number) => x + 2);
        expect(mapped1.hasValue && mapped1.value).toBe(7);
        const mapped2 = m.map((x: number) => x > 2);
        expect(mapped2.hasValue && mapped2.value).toBe(true);
    });
});

describe("Either match function", () => {
    it("Should run the left branch for a left", () => {
        let result = 0;
        left(7).match(
            (v) => {
                result = v;
            },
            (_f) => {}
        );
        expect(result).toBe(7);
    });
    it("Should run the right branch for a right", () => {
        let result = 0;
        right(8).match(
            (_v) => {},
            (f) => {
                result = f;
            }
        );
        expect(result).toBe(8);
    });
});

describe("Either.equal", () => {
    it("checks equality", () => {
        const m = right(5);
        const n = right("left");
        const o = left("right");
        expect(m.equals(m)).toBeTruthy();
        expect(n.equals(n)).toBeTruthy();
        expect(o.equals(o)).toBeTruthy();
        expect(m.equals(n)).toBeFalsy();
        expect(n.equals(o)).toBeFalsy();
        expect(m.equals(o)).toBeFalsy();
    });
});

describe("Either.reduce", () => {
    it("should return a value in", () => {
        const u = right<{ test: string }>({ test: "test" }).reduce(
            (_, w) => w.test,
            ""
        );
        expect(u).toBe("test");
        const v = (left<string>("error") as Either<string, unknown>).reduce(
            (_, w: { test: string }) => w.test,
            "dummy"
        );
        expect(v).toBe("dummy");
    });
});

describe("Converting either monad to maybe monad", () => {
    it("should convert a Right into a Just", () => {
        const t = right(5);
        expect(t.toMaybe().hasValue).toBe(true);
        expect(t.toMaybe().orElse(0)).toBe(5);
    });
    it("should convert a Left into a Nothing", () => {
        const t = left(0);
        expect(t.toMaybe().hasValue).toBe(false);
        expect((t as Either<number, number>).toMaybe().orElse(0)).toBe(0);
    });
});

describe("Converting either monad to promise", () => {
    it("should convert a Right into a resolve", async () => {
        const t = await right(5).toPromise();
        expect(t).toBe(5);
    });
    it("should convert a Left into a reject", (done) => {
        const t = left(0).toPromise();
        t.catch(() => {
            done();
        });
    });
});

describe("Flattening an array of Eithers", () => {
    it("should give you an Either array", () => {
        const eithers = [right(5), right(4), right(3)];
        const flattened = flatten(eithers) as Either<unknown[], number[]>;
        expect(flattened.isRight).toBe(true);
        const flattened2 = flatten(eithers);
        expect(flattened2.isRight).toBe(true);
    });
    it("should be a left if any either is a left", () => {
        const eithers = [right<number>(5), left<number>(4), right<number>(3)];
        const flattened = flatten(eithers) as Either<number[], number[]>;
        expect(flattened.isLeft).toBe(true);
        expect(
            (
                flatten([
                    left<number>(5),
                    right<number>(4),
                    right<number>(3),
                ]) as Either<number[], number[]>
            ).isLeft
        ).toBe(true);
        expect(
            (
                flatten([
                    right<number>(5),
                    right<number>(4),
                    left<number>(3),
                ]) as Either<number[], number[]>
            ).isLeft
        ).toBe(true);
        expect(
            flatten([left<number>(5), right<number>(4), right<number>(3)])
                .isLeft
        ).toBe(true);
        expect(
            flatten([right<number>(5), right<number>(4), left<number>(3)])
                .isLeft
        ).toBe(true);
    });
});

describe("empty", () => {
    it("returns an arbitrary left", () => {
        expect(empty().isRight).toBeFalsy();
        expect(empty().isLeft).toBeTruthy();
        expect(empty().isEmpty()).toBeTruthy();
        expect(empty().equals(left(1).empty())).toBeTruthy();
    });
});
