import {
  assertEquals,
  assert,
  assertFalse,
  assertRejects,
} from "jsr:@std/assert";

import {
  type Try,
  type Maybe,
  maybe,
  clean,
  flatten,
  call,
  right,
  map,
  flatMap,
  is,
  type Either,
  type Monad,
} from "../monads.ts";
import { empty as TryEmpty } from "../src/trymonad.ts";
import { empty as MaybeEmpty } from "../src/maybemonad.ts";
import { empty as EitherEmpty, Left } from "../src/eithermonad.ts";
import type { Right } from "../src/eithermonad.ts";

Deno.test("A maybe factory", () => {
  Deno.test("should return Just(5) for a value of 5", () => {
    const mb = Array<Maybe<number>>(
      maybe<number>(null),
      maybe(4),
      maybe<number>(undefined),
      maybe(2),
      maybe<number>(null)
    );
    const cleaned = clean<number, Maybe<number>, Maybe<number>>(mb);
    assertEquals(cleaned.length, 2);
    assertEquals(cleaned[0], 4);
    assertEquals(cleaned[1], 2);
  });
});

Deno.test("Flatten", () => {
  Deno.test(
    "should return nothing for an empty array encapsuled in an arbDeno.test(rary monad",
    () => {
      assert(
        flatten<number, Maybe<number>, Maybe<number>>([]).nothing != undefined
      );
    }
  );
  Deno.test(
    "if empty is given, return the correct empty monad for empty arrays",
    () => {
      // eslint-disable-next-line @typescript-eslint/no-explicDeno.test(-any
      const a: any[] = [];
      assert(
        flatten<number, Try<number>, Try<number>>(a, TryEmpty).succeeded !=
          undefined
      );
      assert(
        flatten<number, Maybe<number>, Maybe<number>>(a, MaybeEmpty).nothing !=
          undefined
      );
      const either = flatten<number, Either<number, number>, any>(
        a,
        EitherEmpty
      ) as unknown as Either<never, number>;
      assert(either.isLeft && !either.hasValue);
    }
  );
  Deno.test("Should properly flatten a filled structure", () => {
    const tries: Array<Try<number>> = [
      call(() => 1),
      call(() => 2),
      call(() => 3),
    ];
    assert(flatten(tries, TryEmpty).succeeded != undefined);
    const maybes: Array<Maybe<number>> = [maybe(1), maybe(2), maybe(3)];
    assert(
      flatten<number, Maybe<number>, Maybe<number>>(maybes, MaybeEmpty)
        .nothing != undefined
    );
    const eithers: Array<Right<number>> = [right(1), right(2), right(3)];
    const either = flatten(eithers, EitherEmpty);
    assert(either.isLeft && either.value != undefined);
  });
});

Deno.test("Functional monads", () => {
  Deno.test("Should be able to use functional map", () => {
    const m1 = map<number, number, Maybe<number>, Maybe<number>>(
      (x: number) => 2 * x,
      maybe(5)
    );
    assert(m1.hasValue);
    assertEquals(m1.hasValue && m1.value, 10);
    const m2 = map<number, number, Try<number>, Try<number>>(
      (x: number) => 2 * x,
      call(() => 5)
    );
    assert(m2.hasValue);
    assertEquals(m2.hasValue && m2.value, 10);
    const m3 = map<number, number, Right<number>, Right<number>>(
      (x: number) => 2 * x,
      right(5)
    );
    assert(m3.hasValue);
    assertEquals(m3.hasValue && m3.value, 10);
  });
  Deno.test("Should be able to use functional flatMap", () => {
    const fm1 = flatMap<
      number,
      number,
      Maybe<number>,
      Maybe<number>,
      Monad<number, Maybe<number>>
    >((x: number) => maybe(2 * x), maybe(5));
    assert(fm1.hasValue);

    assertEquals(fm1.hasValue && fm1.value, 10);
    const fm2 = flatMap<
      number,
      number,
      Try<number>,
      Try<number>,
      Monad<number, Try<number>>
    >(
      (x: number) => call(() => 2 * x),
      call(() => 5)
    );
    assert(fm2.hasValue);

    assertEquals(fm2.hasValue && fm2.value, 10);
    const fm3 = flatMap<
      number,
      number,
      Right<number>,
      Right<number>,
      Monad<number, Right<number>>
    >((x: number) => right(2 * x), right(5));
    assert(fm3.hasValue);
    assertEquals(fm3.hasValue && fm3.value, 10);
  });
  Deno.test("Should be able to use functional is", () => {
    assert(is((x: number) => x > 2, maybe(5)));
  });
});
