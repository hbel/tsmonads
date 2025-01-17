# tsmonads

### Monads in TypeScript

_tsmonads_ provides some basic, strictly typed monadic data types for use with TypeScript, namely MayBe, Try and Either monads. It's API is heavily inspired by the according types in the Scala lanaguge API. It has **no** dependencies and can even be used (although without most of it's benefits) in JavaScript.

# Install

deno: `deno add jsr:@itu/tsmonads`

NPM: `npm install tsmonads`

Yarn: `yarn add tsmonads`

# Usage

Simply `import` the needed functions and classes from `"tsmonad`.

# Breaking changes in 4.x

-   Several utitily functions are now more strict and may accept fewer input types.
-   Overridden utility functions for specific monads (like empty, chain, and flatten) where moved into the monad's respective namespace to make them more usable.

# Breaking changes in 3.x

-   We improved statical type analysis in 3.0. This might lead to incompatibilities when using the library without checking the return values correctly.
-   Global functions (map, flatMap) now return the correct type inferred from the incoming monad's type and the mapping function
-   `unsafeLift()` was removed from all monads to ensure type safety
-   Where default types are set for `Either::Left`, `Error` is now used instead of `string`

# Application

## Maybe

A Maybe either contains _just_ a value or _nothing_. You can easily create new Maybe instances using the _maybe_ factory function:

```
import {maybe} from "tsmonads";

const five = maybe(5); // Type of Maybe is infereed to be "number"
const n?: number;
[...]
const maybeANumber = maybe(n); // maybeANumber will be a Maybe<number>. Wether it contains a value depends on n being a number or undefined.
const nothingAtAll = maybe<number>(null); // nothingAtAll is Nothing. The generic type has to given explicitly because it cannot be inferred from the argument.
```

You can use _map()_ and _forEach()_ to transform the Maybe into another contained type or to perform side-effects on it's value. If the maybe is nothing, this is
a no-op.

```
import {maybe} from "tsmonads";
const m = maybe(5);
const seven = m.map(x => x + 2);
const show = m.forEach(x => console.log(x));
```

You can extract the value from a maybe safely by supplying a default to its _orElse()_-function. If you need more control, you can use _match()_ and suppy functions to handle the value and nothing case explicitly:

```
import {maybe} from "tsmonads";
const m: Maybe<number>;
[...]
const extractedValueOrZero = m.orElse(0);
const doSomethingWithTheValue = m.match(x => 2*x, () => -1);
```

## Try

Use _Try_ to safely encapsulate a function call that may throw an exception. Try will either be a _Success_ wrapping the return value of the function or a _Failure_. Use try via the _call_ factory function.

```
import {call} from "tsmonads";
const retVal = call(() => 2+5); // retVal is Success<number>(7)
const fail = call(() => throw "Error"); // retVal is Failure("Error");
```

Like a Maybe, you can use map() and forEach() on a Try. For more control, supply functions to its _onSuccess()_ and _onFailure()_ handlers:

```
import {call} from "tsmonads";
const retVal = call(() => 2+5);
retVal.onSuccess(s => console.log(s)).onFailure(e => console.log("An error occured"));
```

If the Error encapsulated by the Failure doesn't matter to you, you can also convert the Try into a Maybe using its _toMaybe()_ method.

## Either

An Either holds either a left or a right value. Usually, the left value denotes an error an the right value represents a successful result. Construct
it using the _left()_ and _right()_ factory functions.

## Further utility functions

Besides the above functions, we also provide some utilities you can use when working with arrays of Monads. The `clean()` function will extract all values
from the monads, throw away any non-values (Nothing, Failure, Left) and return an array of the extracted values. The `flatten()` function will turn an `Array<Monad<T>>` into a `Monad<Array<T>>`. Note that you will receive a "negatively typed" array if even single value in the original array is Nothing/Failure/Left. Otherwise, you'll get a `Just<Array<T>>`, `Success<Array<T>>` or `Right<Array<T>>`. All monad types provide a typed wrapper
of flatten as a static method so you don't need to type-cast any results of the flatten method.
