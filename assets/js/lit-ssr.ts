import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline/promises";

import "@lit-labs/ssr/lib/install-global-dom-shim";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit-html";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";

import "./components/index";

// @ts-expect-error this is just an opt-in into Context support for SSR
globalThis.litSsrCallConnectedCallback = true;

const rl = readline.createInterface({ input, output });

rl.on("line", async (line) => {
  const [pid, templateJson] = line.split("\t", 2);
  if (!pid) {
    return output.write("error\tinvalid input: missing pid\n");
  }
  try {
    const result = await collectResult(
      render(html`${unsafeHTML(JSON.parse(templateJson))}`),
    );
    output.write(`rendered\t${pid}\t${JSON.stringify(result)}\n`);
  } catch (e) {
    output.write(`error\t${pid}\t${e}\n`);
    console.error(e);
  }
});

// shut down when phoenix stops
process.stdin.on("close", () => {
  process.exit(0);
});
process.stdin.resume();
