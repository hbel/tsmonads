import { chain, empty, match, nothing, or, orElse, orUndefined } from "../src/maybemonad";
import { flatten, forEach, maybe, Maybe } from "./../monads";

describe("A maybe factory", () => {
    it("should return Just(5) for a value of 5", () => {
        const m = maybe(5);
        expect(m.nothing).toBe(false);
        expect(m.orElse(0)).toBe(5);
        expect(m.hasValue && m.value).toBe(5);
    });
    it("should return Nothing for a value of null", () => {
        const m = maybe<number>(null);
        expect(m.nothing).toBe(true);
        expect(m.orElse(0)).toBe(0);
    });
});

describe("nothing()", () => {
    it("should set a maybe of arbitrary type to nothing", () => {
        const m: Maybe<number> = nothing();
        expect(m.nothing).toBe(true);
        expect(m.orElse(0)).toBe(0);
    });
});

describe("Maybe.match", () => {
    it("should run a matcher function depending on it's contents", () => {
        const u = maybe(5).match((x) => x + 1, () => 0);
        expect(u).toBe(6);
        const v = maybe<number>(null).match((x) => x + 1, () => 0);
        expect(v).toBe(0);
    });
});

describe("Maybe.reduce", () => {
    it("should return a value in", () => {
        const u = maybe({ test: "test" }).reduce((_, t) => t.test, "");
        expect(u).toBe("test");
        const v = (nothing() as Maybe<any>).reduce((_: any, t: any) => t.test, "dummy");
        expect(v).toBe("dummy");
    });
});

describe("Maybe.foreach", () => {
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
        expect(chain(m).orUndefined()).toBe(5);
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

describe("Maybe.or", () => {
    it("returns the original Maybe", () => {
        const m = maybe(5);
        const n = maybe("foobar");
        expect(m.or(n)).toEqual(m);
    });
    it("returns the given Maybe", () => {
        const m = nothing();
        const n = maybe("foobar");
        expect(m.or(n)).toEqual(n);
    });
});

describe("Maybe.equal", () => {
    it("checks equality", () => {
        const m = maybe(5);
        const n = maybe("foobar");
        const o = nothing();
        expect(m.equals(m)).toBeTruthy();
        expect(n.equals(n)).toBeTruthy();
        expect(o.equals(o)).toBeTruthy();
        expect(m.equals(n)).toBeFalsy();
        expect(n.equals(o)).toBeFalsy();
        expect(m.equals(o)).toBeFalsy();
    });
});

describe("Converting maybe monad to promise", () => {
    it("should convert a some into a resolve", async () => {
        const t = await maybe(5).toPromise();
    	expect(t).toBe(5);
    });
    it("should convert a nothing into a reject", (done) => {
        const t = nothing().toPromise();
		t.catch(() => done());
    });
});

describe("Converting maybe monad to an either", () => {
    it("should convert a some into a right", () => {
        const t = maybe(5).toEither();
    	expect(t.hasValue && t.value).toBe(5);
    });
    it("should convert a nothing into a left", () => {
        const t = nothing().toEither();
		expect(t.isLeft).toBeTruthy();
    });
});

describe("A Maybe", () => {
    it("should also work when encapsulating a boolean", () => {
        const m = maybe(true);
        expect(m.hasValue).toBe(true);
        expect(m.hasValue).toBe(true);
        expect(m.nothing).toBe(false);
    });
    it("should map to new monads correctly for correct result", () => {
        const m = maybe(5).map((x) => 2 * x).flatMap((y) => maybe(y / 2));
        expect(m.nothing).toBe(false);
        expect(m.orElse(0)).toBe(5);
        expect(m.hasValue && m.value).toBe(5);
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
        const mbArray2 = flatten(mbList);
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

describe("maybe functions, ", () => {
    it("match should use internal match", () => {
        const val = (v: number) => v;
        const none = () => 0;
        expect(match(maybe(5), val, none)).toBe(maybe(5).match(val, none));
        expect(match(nothing(), val, none)).toBe(nothing().match(val, none));
    })
    it("or should use internal or", () => {
		const or1 = or(maybe(5), maybe(6));
        expect(or1.hasValue && or1.value).toBe(5);
		const or2 = or(nothing(), maybe(6));
        expect(or2.hasValue && or2.value).toBe(6);
    })
    it("orElse should use internal orElse", () => {
        expect(orElse(maybe(5), 6)).toBe(5);
        expect(orElse(nothing(), 6)).toBe(6);
    })
    it("orUndefined should use internal orUndefined", () => {
        expect(orUndefined(maybe(5))).toBe(5);
        expect(orUndefined(nothing())).toBeFalsy();
    })
})

describe("empty", () => {
	it("returns nothing", async () => {
		expect(empty().hasValue).toBeFalsy();
		expect(empty().nothing).toBeTruthy();
		expect(empty().isEmpty()).toBeTruthy();
		expect(empty().equals(maybe(1).empty())).toBeTruthy();
	})
});
