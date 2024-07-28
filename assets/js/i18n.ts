import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
// @ts-expect-error This doesn't have @types
import Cache from "i18next-localstorage-cache";

// eslint-disable-next-line
(window as any).i18next = await i18next.use(Cache).use(LanguageDetector).init();
