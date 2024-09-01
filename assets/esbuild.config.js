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
    "js/app.ts",
    "js/site.ts",
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
  ...contextBase,
  entryPoints: [
    "js/service-worker.ts",
  ],
  outfile: "../priv/static/service-worker.js",
});

const litSSRContext = await esbuild.context({
  ...contextBase,
  external: [
    "node:process",
    "node:readline",
  ],
  entryPoints: [
    "js/lit-ssr.ts",
  ],
  outfile: "../priv/lit-ssr.js",
  platform: "node",
  format: "cjs",
});

if (!watch) {
  await Promise.all([mainContext.rebuild(), swContext.rebuild(), litSSRContext.rebuild()]);
  process.exit(0);
} else {
  // https://github.com/vitejs/vite/issues/5743
  process.stdin.on("close", () => { process.exit(0) })
  process.stdin.resume()

  await Promise.all([mainContext.watch(), swContext.watch(), litSSRContext.watch()]);
}
