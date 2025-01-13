import {
  assertEquals,
  assert,
  assertFalse,
  assertRejects,
} from "jsr:@std/assert";

import {
  forEach,
  maybe,
  Maybe,
  match,
  nothing,
  or,
  orElse,
  orUndefined,
} from "./../monads.ts";

Deno.test("A maybe factory", () => {
  Deno.test("should return Just(5) for a value of 5", () => {
    const m = maybe(5);
    assertFalse(m.nothing);
    assertEquals(m.orElse(0), 5);
    assertEquals(m.hasValue && m.value, 5);
  });
  Deno.test("should return Nothing for a value of null", () => {
    const m = maybe<number>(null);
    assert(m.nothing);
    assertEquals(m.orElse(0), 0);
  });
});

Deno.test("nothing()", () => {
  Deno.test("should set a maybe of arbitrary type to nothing", () => {
    const m: Maybe<number> = nothing();
    assert(m.nothing);
    assertEquals(m.orElse(0), 0);
  });
});

Deno.test("Maybe.match", () => {
  Deno.test(
    "should run a matcher function depending on Deno.test's contents",
    () => {
      const u = maybe(5).match(
        (x) => x + 1,
        () => 0
      );
      assertEquals(u, 6);
      const v = maybe<number>(null).match(
        (x) => x + 1,
        () => 0
      );
      assertEquals(v, 0);
    }
  );
});

Deno.test("Maybe.reduce", () => {
  Deno.test("should return a value in", () => {
    const u = maybe({ test: "test" }).reduce((_, t) => t.test, "");
    assertEquals(u, "test");
    const v = (nothing() as Maybe<any>).reduce(
      (_: any, t: any) => t.test,
      "dummy"
    );
    assertEquals(v, "dummy");
  });
});

Deno.test("Maybe.foreach", () => {
  Deno.test("will run a function only if the monad holds a value", () => {
    let x = 1;
    maybe(5).forEach((y) => (x = x + y));
    assertEquals(x, 6);
    maybe<number>(null).forEach((y) => (x = x + y));
    assertEquals(x, 6);
  });
});

Deno.test("On a collection of Maybes", () => {
  Deno.test(
    "foreach's parameter should be executed on each element that holds a value",
    () => {
      let mbList: Array<Maybe<number>> = [1, 2, 3, 4].map((k) => maybe(k)); // Array of Maybe<number>
      let x = 0;
      forEach(mbList, (y: number) => (x = x + y));
      assertEquals(x, 10);
      mbList = [null, 2, null, 4].map((xx) => maybe(xx)); // Array of Maybe<number>
      x = 0;
      forEach(mbList, (y: number) => (x = x + y));
      assertEquals(x, 6);
    }
  );
});

Deno.test("A maybe of a maybe", () => {
  Deno.test("can be chained into a maybe", () => {
    const m = maybe(maybe(5));
    assertEquals(Maybe.chain(m).orUndefined(), 5);
  });
});

Deno.test("Maybe.if", () => {
  Deno.test("returns true", () => {
    const m: boolean = maybe(5).is((x) => x < 6);
    assert(m);
  });
  Deno.test("returns false", () => {
    const m: boolean = maybe(5).is((x) => x > 6);
    assertFalse(m);
    assertFalse(nothing().is((x) => x > 5));
  });
});

Deno.test("Maybe.or", () => {
  Deno.test("returns the original Maybe", () => {
    const m = maybe(5);
    const n = maybe("foobar");
    assertEquals(m.or(n), m);
  });
  Deno.test("returns the given Maybe", () => {
    const m = nothing();
    const n = maybe("foobar");
    assertEquals(m.or(n), n);
  });
});

Deno.test("Maybe.equal", () => {
  Deno.test("checks equalDeno.testy", () => {
    const m = maybe(5);
    const n = maybe("foobar");
    const o = nothing();
    assert(m.equals(m));
    assert(n.equals(n));
    assert(o.equals(o));
    assertFalse(m.equals(n));
    assertFalse(n.equals(o));
    assertFalse(m.equals(o));
  });
});

Deno.test("Converting maybe monad to promise", () => {
  Deno.test("should convert a some into a resolve", async () => {
    const t = await maybe(5).toPromise();
    assertEquals(t, 5);
  });
  Deno.test("should convert a nothing into a reject", async () => {
    await assertRejects(() => nothing().toPromise());
  });
});

Deno.test("Converting maybe monad to an eDeno.testher", () => {
  Deno.test("should convert a some into a right", () => {
    const t = maybe(5).toEither();
    assertEquals(t.hasValue && t.value, 5);
  });
  Deno.test("should convert a nothing into a left", () => {
    const t = nothing().toEither();
    assert(t.isLeft);
  });
});

Deno.test("A Maybe", () => {
  Deno.test("should also work when encapsulating a boolean", () => {
    const m = maybe(true);
    assert(m.hasValue);
    assert(m.hasValue);
    assertFalse(m.nothing);
  });
  Deno.test("should map to new monads correctly for correct result", () => {
    const m = maybe(5)
      .map((x) => 2 * x)
      .flatMap((y) => maybe(y / 2));
    assertFalse(m.nothing);
    assertEquals(m.orElse(0), 5);
    assertEquals(m.hasValue && m.value, 5);
  });
  Deno.test("should map to new monads correctly for Nothing", () => {
    const m = maybe<number>(null)
      .map((x) => 2 * x)
      .flatMap((y) => maybe(y / 2));
    assert(m.nothing);
    assertEquals(m.orElse(0), 0);
  });
  Deno.test(
    "should allow combining wrapped values into new, composDeno.tested ones",
    () => {
      const m = maybe(1);
      const n = maybe(2);
      // combine m,m into a Maybe<[number,number]>. Just creating a new tuple
      // would give as a [Maybe<number>,Maybe<number>] what is obviously not what we want
      const tuple = m.flatMap((xx) => n.flatMap((yy) => maybe([xx, yy])));
      assertFalse(tuple.nothing);
      const [x, y] = tuple.orElse([0, 0]);
      assertEquals(x, 1);
      assertEquals(y, 2);

      // We can also do this using the flatten() helper function:

      const mbList = [1, 2, 3, 4].map((xx) => maybe(xx)); // Array of Maybe<number>
      // Turn this into a Maybe[Array<number>]
      const mbArray = Maybe.flatten(mbList);
      assertFalse(mbArray.nothing);
      const normalArray = mbArray.orElse([]);
      assertEquals(normalArray.length, 4);
      assertEquals(normalArray[0], 1);
      assertEquals(normalArray[2], 3);
      const mbArray2 = Maybe.flatten(mbList);
      assertFalse(mbArray2.nothing);
    }
  );
  Deno.test(
    "Flattening an empty array of Maybes should result in an empty Maybe<Array>",
    () => {
      const arr: Array<Maybe<number>> = [];
      const flattened = Maybe.flatten(arr);
      assertFalse(flattened.hasValue);
    }
  );
  Deno.test(
    "should be a value for Just and undefined when using orUndefined()",
    () => {
      const m = maybe(5);
      const n = nothing();
      assertEquals(m.orUndefined(), 5);
      assertEquals(n.orUndefined(), undefined);
    }
  );
});

Deno.test("maybe chaining should remove one level of maybe", () => {
  const vals = maybe(maybe(5));
  const result = Maybe.chain(vals);
  assertEquals(result.orUndefined(), 5);
});

Deno.test("maybe functions, ", () => {
  Deno.test("match should use internal match", () => {
    const val = (v: number) => v;
    const none = () => 0;
    assertEquals(match(maybe(5), val, none), maybe(5).match(val, none));
    assertEquals(match(nothing(), val, none), nothing().match(val, none));
  });
  Deno.test("or should use internal or", () => {
    const or1 = or(maybe(5), maybe(6));
    assertEquals(or1.hasValue && or1.value, 5);
    const or2 = or(nothing(), maybe(6));
    assertEquals(or2.hasValue && or2.value, 6);
  });
  Deno.test("orElse should use internal orElse", () => {
    assertEquals(orElse(maybe(5), 6), 5);
    assertEquals(orElse(nothing(), 6), 6);
  });
  Deno.test("orUndefined should use internal orUndefined", () => {
    assertEquals(orUndefined(maybe(5)), 5);
    assertFalse(orUndefined(nothing()));
  });
});

Deno.test("empty", () => {
  Deno.test("returns nothing", () => {
    assertFalse(Maybe.empty().hasValue);
    assert(Maybe.empty().nothing);
    assert(Maybe.empty().isEmpty());
  });
});
