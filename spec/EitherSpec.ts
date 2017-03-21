import {left,right} from "./../src/monads";

const jasmine = require("jasmine");

describe ("A left value", () => {
    it("should return an Either that has a left and no right value", () => {
        const m = left(5);
        expect(m.isLeft()).toBe(true);
        expect(m.isRight()).toBe(false);
        expect(m.left()).toBe(5);
        expect(m.right).toThrow(new Error("No right value"));
    });    
    it("should be mappable using map and flatmap", () => {
        const m = left<number,number>(5);
        expect(m.map(x=>x+2).left()).toBe(5);
        expect(m.map(x=>x>2).left()).toBe(5);
    });
});

describe ("A right value", () => {
    it("should return an Either that has a right and no left value", () => {
        const m = right(5);
        expect(m.isRight()).toBe(true);
        expect(m.isLeft()).toBe(false);
        expect(m.right()).toBe(5);
        expect(m.left).toThrow(new Error("No left value"));
    });    
    it("should be mappable using map and flatmap", () => {
        const m = right(5);
        expect(m.map(x=>x+2).right()).toBe(7);
        expect(m.map(x=>x>2).right()).toBe(true);
    });
});