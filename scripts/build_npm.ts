import { build, emptyDir } from "https://deno.land/x/dnt@0.37.0/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./monads.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  package: {
    name: "tsmonads",
    version: Deno.args[0],
    description: "Scala-styled monads for Typescript",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/hbel/tsmonads.git",
    },
    bugs: {
      url: "https://github.com/hbel/tsmonads/issues",
    },
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
