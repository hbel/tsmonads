import { maybe, call, clean } from "../monads.ts";
import * as Try from "../src/trymonad.ts";

const add10 = (a: number) => a + 10;

const m = maybe(5);

call(() => add10(10)).onSuccess(console.log);
console.log(call(() => m.map(add10)).toMaybe());

const subtract10 = (a: number) => {
  if (a >= 10) {
    return a - 10;
  } else {
    throw "Result would be less zero";
  }
};

const tries = [4, 8, 12, 16].map((x) => call(() => subtract10(x)));
console.log(tries);
const tried = Try.flatten(tries);
console.log(tried);
tried.forEach(console.log);
const cleaned = clean<number, Try.Try<number>, Try.Try<number>>(tries);
console.log(cleaned);
