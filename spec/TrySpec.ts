import {call, flatten} from "./../src/monads";

const jasmine = require("jasmine");

describe ("The call function", () => {
    it("should succeed with 5 for a function of f=2+3", () => {
        const t = call( () => 2 + 3 );
        expect(t.succeeded).toBe(true);
        expect(t.result).toBe(5);
        t.onSuccess( (x) => { expect(x).toBe(5); } );
        t.onFailure( (err) => { throw new Error(); } ); // This should not be called
    });
    it("should throw an error when accessing the error function on a succesful call", () => {
        const t = call( () => 2 + 3 );
        expect(() => t.error).toThrow(new Error("No error occured"));
    });
    it("should return Failure(TypeError) for a value of f=throw new TypeError", () => {
        const t = call<number>( () => { throw new TypeError("Foo"); } );
        expect(t.succeeded).toBe(false);
        expect(t.error.message).toBe("Foo");
        expect(t.error.name).toBe("TypeError");
        t.onFailure( (err) => { expect(err.message).toBe("Foo"); } );
        t.onSuccess( (x) => { throw new Error(); } ); // This should not be called
    });
    it("should throw an exception if result is accessed on a Failure", () => {
        const t = call<number>( () => { throw new TypeError("Foo"); } );
        expect(() => t.result).toThrow(new Error("Try resulted in an error!"));
    });
});

describe ("Mapping Try monads", () => {
    it("should allow to queue several function calls, even when changing return types", () => {
        const t = call( () => 2 + 3 );
        let t2 = t.map( x => x + 2 ).map( x => x > 5 );
        expect(t2.succeeded).toBe(true);
        expect(t2.result).toBe(true);
    });
    it("should propagate errors correctly through mapping", () => {
        const t = call<number>( () => {throw new TypeError("Bar"); } );
        let t2 = t.map( x => x + 2 ).map( x => x > 5 );
        expect(t2.succeeded).toBe(false);
        expect(t2.error.message).toBe("Bar");
        expect(t2.error.name).toBe("TypeError");
    });
});

describe ("Flatmap of Try monads", () => {
    it("should allow to queue several function calls, even when changing return types", () => {
        const t = call( () => 2 + 3 );
        let t3 = t.flatMap( x => call( () => x + 2)).flatMap(x => call( () => x > 6));
        expect(t3.succeeded).toBe(true);
        expect(t3.result).toBe(true);
    });
    it("should propagate errors correctly through mapping", () => {
        const t = call<number>( () => {throw new TypeError("Bar"); } );
        let t3 = t.flatMap( x => call( () => x + 2));
        expect(t3.succeeded).toBe(false);
        expect(t3.error.message).toBe("Bar");
        expect(t3.error.name).toBe("TypeError");
    });
});

describe ("Flatten on an array of try monads", () => {
    it("will produce a Try of an array of the corresponding functions", () => {
        const t1 = call( () => 2 + 3 );
        expect(t1.succeeded).toBe(true);
        const t2 = call( () => 3 + 5 );
        expect(t2.succeeded).toBe(true);
        const t3 = call( () => 7 + 1 );
        expect(t3.succeeded).toBe(true);
        const tryList = [t1, t2, t3];
        const tryArray = flatten(tryList);
        expect(tryArray.succeeded).toBe(true);
    });
    it("will set a flattened try array to failure if a single function call failed", () => {
        const t1 = call( () => 2 + 3 );
        const t2 = call( () => { throw new Error(); } );
        const t3 = call( () => 7 + 1 );
        const tryList = [t1, t2, t3];
        const tryArray = flatten(tryList);
        expect(tryArray.succeeded).toBe(false);
    });
});