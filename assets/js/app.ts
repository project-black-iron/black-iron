// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html";
import "./components";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
// @ts-expect-error This doesn't have @types
import Cache from "i18next-localstorage-cache";
// import topbar from "../vendor/topbar"

// eslint-disable-next-line
(window as any).i18next = i18next.use(Cache).use(LanguageDetector).init();
