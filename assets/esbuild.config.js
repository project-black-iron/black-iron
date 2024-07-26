import { typecheckPlugin } from "@jgoz/esbuild-plugin-typecheck";
import esbuild from "esbuild";
import process from "process";

const prod = process.argv[2] === "production";
const watch = !prod && process.argv[2] !== "nowatch";

const context = await esbuild.context({
  entryPoints: ["js/app.ts", "css/app.css"],
  bundle: true,
  loader: {
    ".svg": "dataurl",
  },
  external: [
    "/fonts/*",
    "/images/*",
  ],
  target: "es2022",
  logLevel: "info",
  treeShaking: prod,
  minify: prod,
  plugins: [
    typecheckPlugin({ watch }),
  ],
});

if (!watch) {
  await context.rebuild();
  process.exit(0);
} else {
  await context.watch();
}
