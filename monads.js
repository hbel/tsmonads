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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
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


/***/ })
/******/ ]);