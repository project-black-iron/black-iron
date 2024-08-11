// This is the general service worker for the app. It covers both the site
// part and the app part.
/// <reference lib="webworker" />

import {
  NavigationRoute,
  registerRoute,
  setDefaultHandler,
} from "workbox-routing";
import { PrecacheController } from "workbox-precaching";
import { NetworkFirst } from "workbox-strategies";

// const CACHE_VERSION = "v1";

const precacheController = new PrecacheController();

// @ts-expect-error this is actually an ExtendableEvent
addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const staticPaths = await getStaticPaths();
      const appPaths = (await getAppPaths()).map(
        (path: string) =>
          path
            .split("/")
            .map((x) => (x.startsWith(":") ? `__${x.slice(1)}` : x))
            .join("/") || "/",
      );
      const allPaths = staticPaths.concat(appPaths);
      precacheController.addToCacheList(
        allPaths.map((path: string) => ({ url: path, revision: null })),
      );
      await precacheController.install(event);
      await cacheStaticPaths(staticPaths);
      await cacheAppPaths(appPaths);
    })(),
  );
});

// @ts-expect-error this is actually an ExtendableEvent
addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      await precacheController.activate(event);
    })(),
  );
});

setDefaultHandler(async ({ request }) => {
  try {
    return await fetch(request);
    // eslint-disable-next-line
  } catch (e) {
    const fallbackUrl = new URL(request.url);
    fallbackUrl.pathname = "/offline";
    fallbackUrl.search = "";
    const fallbackResponse = await caches.match(fallbackUrl);
    if (fallbackResponse) {
      return fallbackResponse;
    } else {
      return new Response("Unable to fall back to offline mode.", {
        status: 408,
        headers: { "Content-Type": "text/plain" },
      });
    }
  }
});

async function getStaticPaths() {
  const response = await fetch("/offline/static_paths");
  if (!response.ok) {
    throw new Error("Failed to fetch offline paths");
  }
  const res = await response.json();
  return res.paths;
}

async function getAppPaths() {
  const response = await fetch("/offline/app_paths");
  if (!response.ok) {
    throw new Error("Failed to fetch app paths");
  }
  const res = await response.json();
  return res.paths;
}

async function cacheStaticPaths(staticPaths: string[]) {
  for (const path of staticPaths) {
    registerRoute(({ url }) => url.pathname === path, new NetworkFirst());
  }
}

async function cacheAppPaths(appPaths: string[]) {
  for (const path of appPaths) {
    const match = path
      .split("/")
      .map((x) => (x.startsWith("__") ? "[^/]+" : x))
      .join("/");
    const regex = new RegExp(`^${match}$`);
    const handler = precacheController.createHandlerBoundToURL(path);
    const navigationRoute = new NavigationRoute(handler, {
      allowlist: [regex],
    });
    registerRoute(navigationRoute, new NetworkFirst());
  }
}
