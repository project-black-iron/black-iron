// This is JS specific to the site portion of the webapp. Ideally, this will
// be kept as lean as possible. Most of the work should be getting done
// server-side.

// Components: we really don't need most of them.
import "./components/bi-theme-picker";

// Launch service worker
import { installServiceWorker } from "./install-sw";

await installServiceWorker();
