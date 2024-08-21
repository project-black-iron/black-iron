// This JS is specific to the game/app portion of the site.

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html";
import "htmx.org";
// import "./i18n";
// import topbar from "../vendor/topbar"

// Components
import "@lit-labs/ssr-client/lit-element-hydrate-support.js";
import "./components/index";

// Launch service worker
import { installServiceWorker } from "./install-sw";

await installServiceWorker();
