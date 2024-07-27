import { typecheckPlugin } from "@jgoz/esbuild-plugin-typecheck";
import eslint from "esbuild-plugin-eslint";
import esbuild from "esbuild";
import process from "process";

const prod = process.argv[2] === "production";
const watch = !prod && process.argv[2] !== "nowatch";

const context = await esbuild.context({
  entryPoints: ["js/app.ts", "css/app.css", "css/theme-dark.css", "css/theme-light.css"],
  outdir: "../priv/static/assets",
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
    eslint({
      warnIgnored: false
    }),
  ],
  nodePaths: [
    "../deps",
  ]
});

if (!watch) {
  await context.rebuild();
  process.exit(0);
} else {
  await context.watch();
}
