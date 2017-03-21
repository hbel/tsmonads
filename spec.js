/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var trymonad_1 = __webpack_require__(3);
exports.call = trymonad_1.call;
var maybemonad_1 = __webpack_require__(2);
exports.maybe = maybemonad_1.maybe;
var eithermonad_1 = __webpack_require__(1);
exports.left = eithermonad_1.left;
exports.right = eithermonad_1.right;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function left(value) {
    if (!value)
        throw Error("Value must not be undefined or null!");
    return new Either(value, undefined);
}
exports.left = left;
function right(value) {
    if (!value)
        throw Error("Value must not be undefined or null!");
    return new Either(undefined, value);
}
exports.right = right;
class Either {
    constructor(left, right) {
        this.isLeft = () => !this._right;
        this.isRight = () => !this._left;
        this.left = () => { if (this.isLeft())
            return this._left; throw new Error("No left value"); };
        this.right = () => { if (this.isRight())
            return this._right; throw new Error("No right value"); };
        this._left = left;
        this._right = right;
    }
    map(f) {
        if (this.isLeft())
            return left(this.left());
        return right(f(this.right()));
    }
    flatMap(f) {
        if (this.isLeft())
            return left(this.left());
        return f(this.right());
    }
}
exports.Either = Either;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function maybe(val) {
    if (!val)
        return new Nothing();
    else
        return new Just(val);
}
exports.maybe = maybe;
class Just {
    constructor(val) {
        if (!val)
            throw new Error("Value must be not null and not undefined");
        this.value = val;
    }
    map(f) {
        return new Just(f(this.value));
    }
    flatMap(f) {
        return f(this.value);
    }
    orElse(def) {
        return this.value;
    }
    unsafeLift() {
        return this.value;
    }
    nothing() { return false; }
    ;
}
class Nothing {
    map(f) {
        return new Nothing();
    }
    flatMap(f) {
        return new Nothing();
    }
    orElse(def) {
        return def;
    }
    unsafeLift() {
        throw new Error("Nothing contains no value");
    }
    nothing() { return true; }
}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function call(f) {
    try {
        const res = f();
        return new Success(res);
    }
    catch (ex) {
        return new Failure(ex);
    }
}
exports.call = call;
class Success {
    constructor(val) { this._value = val; }
    onSuccess(f) { f(this._value); return this; }
    onFailure(f) { return this; }
    succeeded() { return true; }
    result() { return this._value; }
    error() { throw new Error("No error occured"); }
    map(f) {
        return call(() => { return f(this._value); });
    }
    flatMap(f) {
        return f(this._value);
    }
}
class Failure {
    constructor(err) { this._error = err; }
    onSuccess(f) { return this; }
    onFailure(f) { f(this._error); return this; }
    succeeded() { return false; }
    result() { throw new Error("Try resulted in an error!"); }
    error() { return this._error; }
    map(f) {
        return this;
    }
    flatMap(f) {
        return this;
    }
}


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("jasmine");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const monads_1 = __webpack_require__(0);
const jasmine = __webpack_require__(4);
describe("A left value", () => {
    it("should return an Either that has a left and no right value", () => {
        const m = monads_1.left(5);
        expect(m.isLeft()).toBe(true);
        expect(m.isRight()).toBe(false);
        expect(m.left()).toBe(5);
        expect(m.right).toThrow(new Error("No right value"));
    });
    it("should be mappable using map and flatmap", () => {
        const m = monads_1.left(5);
        expect(m.map(x => x + 2).left()).toBe(5);
        expect(m.map(x => x > 2).left()).toBe(5);
    });
});
describe("A right value", () => {
    it("should return an Either that has a right and no left value", () => {
        const m = monads_1.right(5);
        expect(m.isRight()).toBe(true);
        expect(m.isLeft()).toBe(false);
        expect(m.right()).toBe(5);
        expect(m.left).toThrow(new Error("No left value"));
    });
    it("should be mappable using map and flatmap", () => {
        const m = monads_1.right(5);
        expect(m.map(x => x + 2).right()).toBe(7);
        expect(m.map(x => x > 2).right()).toBe(true);
    });
});


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const monads_1 = __webpack_require__(0);
const jasmine = __webpack_require__(4);
describe("A maybe factory", () => {
    it("should return Just(5) for a value of 5", () => {
        const m = monads_1.maybe(5);
        expect(m.nothing()).toBe(false);
        expect(m.orElse(0)).toBe(5);
        expect(m.unsafeLift()).toBe(5);
    });
    it("should return Nothing for a value of null", () => {
        const m = monads_1.maybe(null);
        expect(m.nothing()).toBe(true);
        expect(m.orElse(0)).toBe(0);
    });
    it("should throw an exception on lifting a nothing", () => {
        const m = monads_1.maybe(null);
        expect(m.unsafeLift).toThrow(new Error("Nothing contains no value"));
    });
    it("should map to new monads correctly for correct result", () => {
        const m = monads_1.maybe(5).map(x => 2 * x).flatMap(y => monads_1.maybe(y / 2));
        expect(m.nothing()).toBe(false);
        expect(m.orElse(0)).toBe(5);
        expect(m.unsafeLift()).toBe(5);
    });
    it("should map to new monads correctly for Nothing", () => {
        const m = monads_1.maybe(null).map(x => 2 * x).flatMap(y => monads_1.maybe(y / 2));
        expect(m.nothing()).toBe(true);
        expect(m.orElse(0)).toBe(0);
    });
});


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const monads_1 = __webpack_require__(0);
const jasmine = __webpack_require__(4);
describe("The call function", () => {
    it("should succeed with 5 for a function of f=2+3", () => {
        const t = monads_1.call(() => 2 + 3);
        expect(t.succeeded()).toBe(true);
        expect(t.result()).toBe(5);
        t.onSuccess((x) => { expect(x).toBe(5); });
        t.onFailure((err) => { throw new Error(); });
    });
    it("should throw an error when accessing the error function on a succesful call", () => {
        const t = monads_1.call(() => 2 + 3);
        expect(t.error).toThrow(new Error("No error occured"));
    });
    it("should return Failure(TypeError) for a value of f=throw new TypeError", () => {
        const t = monads_1.call(() => { throw new TypeError("Foo"); });
        expect(t.succeeded()).toBe(false);
        expect(t.error().message).toBe("Foo");
        expect(t.error().name).toBe("TypeError");
        t.onFailure((err) => { expect(err.message).toBe("Foo"); });
        t.onSuccess((x) => { throw new Error(); });
    });
    it("should throw an exception if result is accessed on a Failure", () => {
        const t = monads_1.call(() => { throw new TypeError("Foo"); });
        expect(t.result).toThrow(new Error("Try resulted in an error!"));
    });
});
describe("Map", () => {
    it("should allow to queue several function calls, even when changing return types", () => {
        const t = monads_1.call(() => 2 + 3);
        let t2 = t.map(x => x + 2).map(x => x > 5);
        expect(t2.succeeded()).toBe(true);
        expect(t2.result()).toBe(true);
    });
    it("should propagate errors correctly through mapping", () => {
        const t = monads_1.call(() => { throw new TypeError("Bar"); });
        let t2 = t.map(x => x + 2).map(x => x > 5);
        expect(t2.succeeded()).toBe(false);
        expect(t2.error().message).toBe("Bar");
        expect(t2.error().name).toBe("TypeError");
    });
});
describe("Flatmap", () => {
    it("should allow to queue several function calls, even when changing return types", () => {
        const t = monads_1.call(() => 2 + 3);
        let t3 = t.flatMap(x => monads_1.call(() => x + 2)).flatMap(x => monads_1.call(() => x > 6));
        expect(t3.succeeded()).toBe(true);
        expect(t3.result()).toBe(true);
    });
    it("should propagate errors correctly through mapping", () => {
        const t = monads_1.call(() => { throw new TypeError("Bar"); });
        let t3 = t.flatMap(x => monads_1.call(() => x + 2));
        expect(t3.succeeded()).toBe(false);
        expect(t3.error().message).toBe("Bar");
        expect(t3.error().name).toBe("TypeError");
    });
});


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(5);
__webpack_require__(6);
module.exports = __webpack_require__(7);


/***/ })
/******/ ]);