import { Either, flatten, left, right } from "./../monads";

describe("A left value", () => {
    it("should return an Either that has a left and no right value", () => {
        const m = left(5);
        expect(m.isLeft).toBe(true);
        expect(m.isRight).toBe(false);
        expect(m.left).toBe(5);
        expect(() => m.right).toThrow(new Error("No right value"));
    });
    it("should be mappable using map and flatmap", () => {
        const m = left<number, number>(5);
        expect(m.map((x: any) => x + 2).left).toBe(5);
        expect(m.map((x: any) => x > 2).left).toBe(5);
    });
});

describe("A right value", () => {
    it("should return an Either that has a right and no left value", () => {
        const m = right(5);
        expect(m.isRight).toBe(true);
        expect(m.isLeft).toBe(false);
        expect(m.right).toBe(5);
        expect(() => m.left).toThrow(new Error("No left value"));
    });
    it("should be mappable using map and flatmap", () => {
        const m = right(5);
        expect(m.map((x: number) => x + 2).right).toBe(7);
        expect(m.map((x: number) => x > 2).right).toBe(true);
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
        const u = right<string, any>({ test: "test" }).reduce((_, w) => w.test, "");
        expect(u).toBe("test");
        const v = left<string, any>("error").reduce((_, w) => w.test, "dummy");
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
        expect(t.toMaybe().orElse(0)).toBe(0);
    });
});


describe("Converting either monad to promise", () => {
    it("should convert a Right into a resolve", async () => {
        const t = await right(5).toPromise();
    	expect(t).toBe(5);
    });
    it("should convert a Left into a reject", (done) => {
        const t = left(0).toPromise();
		t.catch(() => done());
    });
});

describe("Flattening an array of Eithers", () => {
    it("should give you an Either array", () => {
        const eithers = [right(5), right(4), right(3)];
        const flattened = flatten(eithers) as Either<any[], number[]>;
        expect(flattened.isRight).toBe(true);
        const flattened2 = Either.flatten(eithers);
        expect(flattened2.isRight).toBe(true);
    });
    it("should be a left if any either is a left", () => {
        const eithers = [right<number, number>(5), left<number, number>(4), right<number, number>(3)];
        const flattened = flatten(eithers) as Either<number[], Array<number>>;
        expect(flattened.isLeft).toBe(true);
        expect((flatten([left<number, number>(5), right<number, number>(4),
        right<number, number>(3)]) as Either<number[], Array<number>>).isLeft).toBe(true);
        expect((flatten([right<number, number>(5), right<number, number>(4),
        left<number, number>(3)]) as Either<number[], number[]>).isLeft).toBe(true);
        expect(Either.flatten([left<number, number>(5), right<number, number>(4),
        right<number, number>(3)]).isLeft).toBe(true);
        expect(Either.flatten([right<number, number>(5), right<number, number>(4),
        left<number, number>(3)]).isLeft).toBe(true);
    });
});

describe("empty", () => {
	it("returns an arbitrary left", async () => {
		expect(Either.empty().isRight).toBeFalsy();
		expect(Either.empty().isLeft).toBeTruthy();
		expect(Either.empty().isEmpty()).toBeTruthy();
		expect(Either.empty().equals(left(1).empty())).toBeTruthy();
	})
});
