import {call} from "./../src/monads";

const jasmine = require("jasmine");

describe ("The call function", () => {
    it("should succeed with 5 for a function of f=2+3", () => {
        const t = call( () => 2 + 3 );
        expect(t.succeeded()).toBe(true);
        expect(t.result()).toBe(5);
        t.onSuccess( (x) => { expect(x).toBe(5); } );
        t.onFailure( (err) => { throw new Error(); } ); // This should not be called
    });
    it("should throw an error when accessing the error function on a succesful call", () => {
        const t = call( () => 2 + 3 );
        expect(t.error).toThrow(new Error("No error occured"));
    });
    it("should return Failure(TypeError) for a value of f=throw new TypeError", () => {
        const t = call<number>( () => { throw new TypeError("Foo"); } );
        expect(t.succeeded()).toBe(false);
        expect(t.error().message).toBe("Foo");
        expect(t.error().name).toBe("TypeError");
        t.onFailure( (err) => { expect(err.message).toBe("Foo"); } );
        t.onSuccess( (x) => { throw new Error(); } ); // This should not be called
    });
    it("should throw an exception if result is accessed on a Failure", () => {
        const t = call<number>( () => { throw new TypeError("Foo"); } );
        expect(t.result).toThrow(new Error("Try resulted in an error!"));
    });
});