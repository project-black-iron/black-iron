// This JS is specific to the game/app portion of the site.

// import "./i18n";
// import topbar from "../vendor/topbar"

// Components
import "@lit-labs/ssr-client/lit-element-hydrate-support.js";
import "./components/index";

// Launch service worker
import { installServiceWorker } from "./install-sw";

await installServiceWorker();
