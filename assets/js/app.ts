// This JS is specific to the game/app portion of the site.

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html";
// import "./i18n";
// import topbar from "../vendor/topbar"

// Components
import "./components/index";

// Launch service worker
import { installServiceWorker } from "./install-sw";

await installServiceWorker();
