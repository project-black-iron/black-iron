// This JS is specific to the game/app portion of the site.

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html";
// import "./i18n";
// import topbar from "../vendor/topbar"

// Components
import "./components/bi-app-context-provider";
import "./components/bi-theme-picker";

// Launch service worker
import { installServiceWorker } from "./install-sw.ts";

await installServiceWorker();
