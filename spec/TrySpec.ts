import {
  assertEquals,
  assert,
  assertFalse,
  assertRejects,
} from "jsr:@std/assert";

import {
  call,
  flatten,
  Try,
  Failure,
  wrapPromise,
  fromValue,
  fromError,
} from "./../monads.ts";

Deno.test("The call function", () => {
  Deno.test("should succeed with 5 for a function of f=2+3", () => {
    const t = call(() => 2 + 3);
    assert(t.succeeded);
    assertEquals(t.succeeded && t.result, 5);
    t.onSuccess((x) => {
      assertEquals(x, 5);
    });
    t.onFailure(() => {
      throw new Error();
    }); // This should  not be called
  });
  Deno.test(
    "should throw an error when accessing the error function on a successful call",
    () => {
      const t = call(() => 2 + 3);
      assertFalse(Object.keys(t).includes("error"));
    }
  );
  Deno.test(
    "should return Failure(TypeError) for a value of f=throw new TypeError",
    () => {
      const t = call<number>(() => {
        throw new TypeError("Foo");
      });
      assertFalse(t.succeeded);
      assertEquals(!t.succeeded && t.error.message, "Foo");
      assertEquals(!t.succeeded && t.error.name, "TypeError");
      t.onFailure((err) => {
        assertEquals(err.message, "Foo");
      });
      t.onSuccess((_) => {
        throw new Error();
      }); // This should not be called
    }
  );
  Deno.test(
    "should throw an exception if result is accessed on a Failure",
    () => {
      const t = call<number>(() => {
        throw new TypeError("Foo");
      });
      assertFalse(Object.keys(t).includes("result"));
    }
  );
});

Deno.test("wraps a promise", () => {
  Deno.test("Produces a succes", async () => {
    const m = await wrapPromise(async () => await Promise.resolve(1));
    assert(m.succeeded);
    assertEquals(m.succeeded && m.result, 1);
  });
  Deno.test("Produces a Failure", async () => {
    const m = await wrapPromise(
      async () => await Promise.reject(new Error("error"))
    );
    assertFalse(m.succeeded);
    assertEquals(!m.succeeded && m.error.message, "error");
  });
});

Deno.test("A try of a try", () => {
  Deno.test("can be chained into a try", () => {
    const m = call(() => call(() => 5));
    const chained = Try.chain(m);
    assert(chained.succeeded);
    assertEquals(chained.succeeded && chained.result, 5);
  });
});

Deno.test("Mapping Try monads", () => {
  Deno.test(
    "should allow to queue several function calls, even when changing return types",
    () => {
      const t = call(() => 2 + 3);
      const t2 = t.map((x) => x + 2).map((x) => x > 5);
      assert(t2.succeeded);
      assert(t2.succeeded && t2.result);
    }
  );
  Deno.test("should propagate errors correctly through mapping", () => {
    const t = call<number>(() => {
      throw new TypeError("Bar");
    });
    const t2 = t.map((x) => x + 2).map((x) => x > 5);
    assertFalse(t2.succeeded);
    assertEquals(!t2.succeeded && t2.error.message, "Bar");
    assertEquals(!t2.succeeded && t2.error.name, "TypeError");
  });
});

Deno.test("Try.reduce", () => {
  Deno.test("should return a value in", () => {
    const u = call<any>(() => ({ test: "test" })).reduce((_, t) => t.test, "");
    assertEquals(u, "test");
    const v = call<any>(() => {
      throw new Error("error");
    }).reduce((_, t) => t.test, "dummy");
    assertEquals(v, "dummy");
  });
});

Deno.test("Try.equal", () => {
  Deno.test("checks equality", () => {
    const t = call(() => 2 + 3);
    const u = call<number>(() => {
      throw new TypeError("Bar");
    });
    assert(t.equals(t));
    assert(u.equals(u));
    assertFalse(t.equals(u));
  });
});

Deno.test("Converting try monad to maybe monad", () => {
  Deno.test("Should convert a Success into a Just", () => {
    const t = call(() => 2 + 3);
    assert(t.toMaybe().hasValue);
    assertEquals(t.toMaybe().orElse(0), 5);
  });
  Deno.test("Should convert a Failure into a Nothing", () => {
    const t = call<number>(() => {
      throw new Error("Error");
    });
    assertFalse(t.toMaybe().hasValue);
    assertEquals(t.toMaybe().orElse(0), 0);
  });
});

Deno.test("Converting try monad to either monad", () => {
  Deno.test("Should convert a Success into a Right", () => {
    const t = call(() => 2 + 3);
    assert(t.toEither().hasValue);
    assert(t.toEither().isRight);
  });
  Deno.test("Should convert a Failure into a Left", () => {
    const t = call<number>(() => {
      throw new Error("Error");
    });
    assertFalse(t.toEither().hasValue);
    assert(t.toEither().isLeft);
  });
});

Deno.test("Converting try  monad to promise", () => {
  Deno.test("should convert a success into a resolve", async () => {
    const t = await call(() => 2 + 3).toPromise();
    assertEquals(t, 5);
  });
  Deno.test("should convert a failure into a reject", async () => {
    const t = call(() => {
      throw new Error("");
    }).toPromise();
    await assertRejects(() => t);
  });
});

Deno.test("Flattening an array of Tries", () => {
  Deno.test("should correctly flatten to success in", async () => {
    const arr = [call(() => 2 + 3), call(() => 3 + 4)];
    const flattened = flatten<number, Try<number>, Try<number>>(arr);
    assertEquals(flattened.succeeded && flattened.result, [5, 7]);
  });
  Deno.test("should correctly flatten to failed in", async () => {
    const arr = [
      call(() => 2 + 3),
      call(() => {
        throw new Error("Foo");
      }),
    ];
    const flattened = flatten<number, Try<number>, Try<number>>(arr);
    assertFalse(flattened.succeeded);
    assertEquals(!flattened.succeeded && flattened.error.message, "Foo");
  });
});

Deno.test("Flatmap of Try monads", () => {
  Deno.test(
    "should allow to queue several function calls, even when changing return types",
    () => {
      const t = call(() => 2 + 3);
      const t3 = t
        .flatMap((x) => call(() => x + 2))
        .flatMap((x) => call(() => x > 6));
      assert(t3.succeeded);
      assert(t3.succeeded && t3.result);
    }
  );
  Deno.test("should propagate errors correctly through mapping", () => {
    const t = call<number>(() => {
      throw new TypeError("Bar");
    });
    const t3 = t.flatMap((x) => call(() => x + 2));
    assertFalse(t3.succeeded);
    assertEquals(!t3.succeeded && t3.error.message, "Bar");
    assertEquals(!t3.succeeded && t3.error.name, "TypeError");
  });
});

Deno.test("Try match function", () => {
  Deno.test("Should run the success branch for a success", () => {
    let result = 0;
    fromValue(7).match(
      (v) => {
        result = v;
      },
      (_f) => {}
    );
    assertEquals(result, 7);
  });
  Deno.test("Should run the failure branch for a failure", () => {
    let result = "";
    fromError(new Error("Something went wrong")).match(
      (_v) => {},
      (f) => {
        result = f.message;
      }
    );
    assertEquals(result, "Something went wrong");
  });
});

Deno.test("Flatten on an array of try monads", () => {
  Deno.test(
    "will produce a Try of an array of the corresponding functions",
    () => {
      const t1 = call(() => 2 + 3);
      assert(t1.succeeded);
      const t2 = call(() => 3 + 5);
      assert(t2.succeeded);
      const t3 = call(() => 7 + 1);
      assert(t3.succeeded);
      const tryList = [t1, t2, t3];
      const tryArray = flatten(tryList) as Try<number[]>;
      assert(tryArray.succeeded);
      const tryArray2 = flatten(tryList) as Try<number[]>;
      assert(tryArray2.succeeded);
    }
  );
  Deno.test(
    "will set a flattened try array to failure if a single function call failed",
    () => {
      const t1 = call(() => 2 + 3);
      const t2 = call(() => {
        throw new Error();
      });
      const t3 = call(() => 7 + 1);
      const tryList = [t1, t2, t3];
      const tryArray = flatten(tryList) as Try<number[]>;
      assertFalse(tryArray.succeeded);
      const tryArray2 = flatten(tryList) as Try<number[]>;
      assertFalse(tryArray2.succeeded);
    }
  );
});

Deno.test("empty", () => {
  Deno.test("returns a Failure with an empty error object", async () => {
    assertFalse(Try.empty().succeeded);
    assertEquals(Try.empty().error.name, new Error().name);
    assert(Try.empty().isEmpty());
    assert(
      Try.empty().error.name === new Failure(new Error()).empty().error.name
    );
  });
});
