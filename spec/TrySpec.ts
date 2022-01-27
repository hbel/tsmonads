import { wrapPromise } from "../src/trymonad";
import { call, flatten, Try } from "./../monads";

describe("The call function", () => {
    it("should succeed with 5 for a function of f=2+3", () => {
        const t = call(() => 2 + 3);
        expect(t.succeeded).toBe(true);
        expect(t.result).toBe(5);
        t.onSuccess((x) => { expect(x).toBe(5); });
        t.onFailure((err) => { throw new Error(); }); // This should not be called
    });
    it("should throw an error when accessing the error function on a succesful call", () => {
        const t = call(() => 2 + 3);
        expect(() => t.error).toThrow(new Error("No error occured"));
    });
    it("should return Failure(TypeError) for a value of f=throw new TypeError", () => {
        const t = call<number>(() => { throw new TypeError("Foo"); });
        expect(t.succeeded).toBe(false);
        expect(t.error.message).toBe("Foo");
        expect(t.error.name).toBe("TypeError");
        t.onFailure((err) => { expect(err.message).toBe("Foo"); });
        t.onSuccess((x) => { throw new Error(); }); // This should not be called
    });
    it("should throw an exception if result is accessed on a Failure", () => {
        const t = call<number>(() => { throw new TypeError("Foo"); });
        expect(() => t.result).toThrow(new Error("Try resulted in an error!"));
    });
});

describe("wraps a promise", () => {
	it("Produces a succes", async () => {
		const m = await wrapPromise(() => Promise.resolve(1));
		expect(m.succeeded).toBeTruthy;
		expect(m.result).toBe(1);
	});
	it("Produces a Failure", async () => {
		const m = await wrapPromise(() => Promise.reject(new Error("error")));
		expect(m.succeeded).toBeFalsy;
		expect(m.error.message).toBe("error");
	});
});

describe("A try of a try", () => {
    it("can be chained into a try", () => {
        const m = call(() => call(() => 5));
        expect(Try.chain(m).succeeded).toBe(true);
        expect(Try.chain(m).result).toBe(5);
    });
});

describe("Mapping Try monads", () => {
    it("should allow to queue several function calls, even when changing return types", () => {
        const t = call(() => 2 + 3);
        const t2 = t.map((x) => x + 2).map((x) => x > 5);
        expect(t2.succeeded).toBe(true);
        expect(t2.result).toBe(true);
    });
    it("should propagate errors correctly through mapping", () => {
        const t = call<number>(() => { throw new TypeError("Bar"); });
        const t2 = t.map((x) => x + 2).map((x) => x > 5);
        expect(t2.succeeded).toBe(false);
        expect(t2.error.message).toBe("Bar");
        expect(t2.error.name).toBe("TypeError");
    });
});

describe("Try.reduce", () => {
    it("should return a value in", () => {
        const u = call<any>(() => ({ test: "test" })).reduce((_, t) => t.test, "");
        expect(u).toBe("test");
        const v = call<any>(() => { throw new Error("error"); }).reduce((_, t) => t.test, "dummy");
        expect(v).toBe("dummy");
    });
});

describe("Try.equal", () => {
    it("checks equality", () => {
        const t = call(() => 2 + 3);
        const u = call<number>(() => { throw new TypeError("Bar"); });
        expect(t.equals(t)).toBeTruthy();
        expect(u.equals(u)).toBeTruthy();
        expect(t.equals(u)).toBeFalsy();
    });
});

describe("Converting try monad to maybe monad", () => {
    it("Should convert a Success into a Just", () => {
        const t = call(() => 2 + 3);
        expect(t.toMaybe().hasValue).toBe(true);
        expect(t.toMaybe().orElse(0)).toBe(5);
    });
    it("Should convert a Failure into a Nothing", () => {
        const t = call<number>(() => { throw new Error("Error"); });
        expect(t.toMaybe().hasValue).toBe(false);
        expect(t.toMaybe().orElse(0)).toBe(0);
    });
});

describe("Converting try  monad to promise", () => {
    it("should convert a success into a resolve", async () => {
        const t = await call(() => 2 + 3).toPromise();
    	expect(t).toBe(5);
    });
    it("should convert a failure into a reject", (done) => {
        const t = call(() => {throw new Error("");}).toPromise();
        t.catch(() => done());
    });
});

describe("Flatmap of Try monads", () => {
    it("should allow to queue several function calls, even when changing return types", () => {
        const t = call(() => 2 + 3);
        const t3 = t.flatMap((x) => call(() => x + 2)).flatMap((x) => call(() => x > 6));
        expect(t3.succeeded).toBe(true);
        expect(t3.result).toBe(true);
    });
    it("should propagate errors correctly through mapping", () => {
        const t = call<number>(() => { throw new TypeError("Bar"); });
        const t3 = t.flatMap((x) => call(() => x + 2));
        expect(t3.succeeded).toBe(false);
        expect(t3.error.message).toBe("Bar");
        expect(t3.error.name).toBe("TypeError");
    });
});

describe("Flatten on an array of try monads", () => {
    it("will produce a Try of an array of the corresponding functions", () => {
        const t1 = call(() => 2 + 3);
        expect(t1.succeeded).toBe(true);
        const t2 = call(() => 3 + 5);
        expect(t2.succeeded).toBe(true);
        const t3 = call(() => 7 + 1);
        expect(t3.succeeded).toBe(true);
        const tryList = [t1, t2, t3];
        const tryArray = flatten(tryList) as Try<number[]>;
        expect(tryArray.succeeded).toBe(true);
        const tryArray2 = Try.flatten(tryList);
        expect(tryArray2.succeeded).toBe(true);
    });
    it("will set a flattened try array to failure if a single function call failed", () => {
        const t1 = call(() => 2 + 3);
        const t2 = call(() => { throw new Error(); });
        const t3 = call(() => 7 + 1);
        const tryList = [t1, t2, t3];
        const tryArray = flatten(tryList) as Try<number[]>;
        expect(tryArray.succeeded).toBe(false);
        const tryArray2 = Try.flatten(tryList);
        expect(tryArray2.succeeded).toBe(false);
    });
});

describe("empty", () => {
	it("returns a Failure with an empty error object", async () => {
		expect(Try.empty().succeeded).toBeFalsy();
		expect(Try.empty().error.name).toEqual(new Error().name);
		expect(Try.empty().isEmpty()).toBeTruthy();
	})
});
