import { typecheckPlugin } from "@jgoz/esbuild-plugin-typecheck";
import esbuild from "esbuild";
import eslint from "esbuild-plugin-eslint";
import process from "process";

const prod = process.argv[2] === "production";
const watch = !prod && process.argv[2] !== "nowatch";

const contextBase = {
  bundle: true,
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
      warnIgnored: false,
    }),
  ],
  format: "esm",
  nodePaths: [
    "../deps",
  ],
};

const mainContext = await esbuild.context({
  ...contextBase,
  entryPoints: [
    "src/app.ts",
    "src/site.ts",
    "src/service-worker.ts",
    "css/app.css",
    "css/theme-dark.css",
    "css/theme-light.css",
  ],
  outdir: "../priv/static/assets",
  loader: {
    ".svg": "dataurl",
  },
});

const swContext = await esbuild.context({
  entryPoints: [
    "src/service-worker.ts",
  ],
  outfile: "../priv/static/service-worker.js",
});

if (!watch) {
  await Promise.all([mainContext.rebuild(), swContext.rebuild()]);
  process.exit(0);
} else {
  await Promise.all([mainContext.watch(), swContext.watch()]);
}
