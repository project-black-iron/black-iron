import { defineConfig, globalIgnores } from "eslint/config";
import pluginJs from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  globalIgnores(["vendor/**/*", "deps/**/*"]),
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
]);
