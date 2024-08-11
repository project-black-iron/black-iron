// This is the general service worker for the app. It covers both the site
// part and the app part, by precaching things that need to be available
// offline.

import {
  registerRoute,
  setCatchHandler,
  setDefaultHandler,
} from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";
import type { RouteHandlerCallbackOptions } from "workbox-core/types";

const CACHE_NAME = "precache-v1";

// @ts-expect-error this is actually an ExtendableEvent
addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(precacheRoutes());
});
// @ts-expect-error this is actually an ExtendableEvent
addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(precacheRoutes());
});

setDefaultHandler(offlineFallback);
setCatchHandler(offlineFallback);

async function precacheRoutes() {
  const staticPaths = await getStaticPaths();
  const appPaths = (await getAppPaths()).map(
    (path: string) =>
      path
        .split("/")
        .map((x) => (x.startsWith(":") ? `__${x.slice(1)}` : x))
        .join("/") || "/",
  );
  const allPaths: string[] = staticPaths.concat(appPaths);
  const pathSet = new Set(allPaths);
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  for (const key of keys) {
    if (!pathSet.has(new URL(key.url).pathname)) {
      await cache.delete(key);
    }
  }
  await cache.addAll(allPaths);
  await routeStaticPaths(staticPaths);
  await routeAppPaths(appPaths);
  routePostRequests();
}

async function offlineFallback({ request }: RouteHandlerCallbackOptions) {
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
}

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

async function routeStaticPaths(staticPaths: string[]) {
  for (const path of staticPaths) {
    registerRoute(
      ({ url }) => url.pathname === path,
      new StaleWhileRevalidate({
        cacheName: CACHE_NAME,
      }),
    );
  }
}

async function routeAppPaths(appPaths: string[]) {
  const networkFirst = new StaleWhileRevalidate({
    cacheName: CACHE_NAME,
  });
  for (const path of appPaths) {
    const match = path
      .split("/")
      .map((x) => (x.startsWith("__") ? "[^/]+" : x))
      .join("/");
    const regex = new RegExp(`^(:?https?://[^/]+)?${match}$`);
    registerRoute(
      ({ url }) => {
        return regex.test(url.href);
      },
      async (opts) => {
        opts.url.pathname = path;
        opts.request = new Request(path);
        return networkFirst.handle(opts);
      },
    );
  }
}

function routePostRequests() {
  registerRoute(() => true, offlineFallback, "POST");
}
