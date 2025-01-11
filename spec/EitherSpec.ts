import {
  assertEquals,
  assert,
  assertFalse,
  assertRejects,
} from "jsr:@std/assert";

import { empty, flatten } from "../src/eithermonad.ts";
import { type Either, left, right } from "./../monads.ts";

Deno.test("A left value", () => {
  Deno.test(
    "should return an Either that has a left and no right value",
    () => {
      const m = left(5);
      assertEquals(m.isLeft, true);
      assertEquals(m.isRight, false);
      assertEquals(m.value, 5);
    }
  );
  Deno.test("should be mappable using map and flatmap", () => {
    const m = left<number>(5);
    const mapped = m.map((x: number) => x + 2);
    assertEquals(!mapped.hasValue && mapped.value, 5);
  });
});

Deno.test("A right value", () => {
  Deno.test(
    "should return an Either that has a right and no left value",
    () => {
      const m = right(5);
      assertEquals(m.isRight, true);
      assertEquals(m.isLeft, false);
      assertEquals(m.value, 5);
    }
  );
  Deno.test("should be mappable using map and flatmap", () => {
    const m = right(5);
    const mapped1 = m.map((x: number) => x + 2);
    assertEquals(mapped1.hasValue && mapped1.value, 7);
    const mapped2 = m.map((x: number) => x > 2);
    assertEquals(mapped2.hasValue && mapped2.value, true);
  });
});

Deno.test("Either match function", () => {
  Deno.test("Should run the left branch for a left", () => {
    let result = 0;
    left(7).match(
      (v) => {
        result = v;
      },
      (_f) => {}
    );
    assertEquals(result, 7);
  });
  Deno.test("Should run the right branch for a right", () => {
    let result = 0;
    right(8).match(
      (_v) => {},
      (f) => {
        result = f;
      }
    );
    assertEquals(result, 8);
  });
});

Deno.test("Either.equal", () => {
  Deno.test("checks equality", () => {
    const m = right(5);
    const n = right("left");
    const o = left("right");
    assert(m.equals(m));
    assert(n.equals(n));
    assert(o.equals(o));
    assertFalse(m.equals(n));
    assertFalse(n.equals(o));
    assertFalse(m.equals(o));
  });
});

Deno.test("Either.reduce", () => {
  Deno.test("should return a value in", () => {
    const u = right<{ test: string }>({ test: "test" }).reduce(
      (_, w) => w.test,
      ""
    );
    assertEquals(u, "test");
    const v = (left<string>("error") as Either<string, unknown>).reduce<string>(
      (_, _2) => "",
      "dummy"
    );
    assertEquals(v, "dummy");
  });
});

Deno.test("Converting either monad to maybe monad", () => {
  Deno.test("should convert a Right into a Just", () => {
    const t = right(5);
    assert(t.toMaybe().hasValue);
    assertEquals(t.toMaybe().orElse(0), 5);
  });
  Deno.test("should convert a Left into a Nothing", () => {
    const t = left(0);
    assertFalse(t.toMaybe().hasValue);
    assertEquals((t as Either<number, number>).toMaybe().orElse(0), 0);
  });
});

Deno.test("Converting either monad to promise", () => {
  Deno.test("should convert a Right into a resolve", async () => {
    const t = await right(5).toPromise();
    assertEquals(t, 5);
  });
  Deno.test("should convert a Left into a reject", async () => {
    await assertRejects(() => left(0).toPromise());
  });
});

Deno.test("Flattening an array of Eithers", () => {
  Deno.test("should give you an Either array", () => {
    const eithers = [right(5), right(4), right(3)];
    const flattened = flatten(eithers) as Either<unknown[], number[]>;
    assert(flattened.isRight);
    const flattened2 = flatten(eithers);
    assert(flattened2.isRight);
  });
  Deno.test("should be a left if any either is a left", () => {
    const eithers = [right<number>(5), left<number>(4), right<number>(3)];
    const flattened = flatten(eithers) as Either<number[], number[]>;
    assert(flattened.isLeft);
    assert(
      (
        flatten([
          left<number>(5),
          right<number>(4),
          right<number>(3),
        ]) as Either<number[], number[]>
      ).isLeft
    );
    assert(
      (
        flatten([
          right<number>(5),
          right<number>(4),
          left<number>(3),
        ]) as Either<number[], number[]>
      ).isLeft
    );
    assert(
      flatten([left<number>(5), right<number>(4), right<number>(3)]).isLeft
    );
    assert(
      flatten([right<number>(5), right<number>(4), left<number>(3)]).isLeft
    );
  });
});

Deno.test("empty", () => {
  Deno.test("returns an arbitrary left", () => {
    assertFalse(empty().isRight);
    assert(empty().isLeft);
    assert(empty().isEmpty());
    assert(empty().equals(left(1).empty()));
  });
});
