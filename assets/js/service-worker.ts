// This is the general service worker for the app. It covers both the site
// part and the app part, by precaching things that need to be available
// offline.

import type { RouteHandlerCallbackOptions } from "workbox-core/types";
import { registerRoute, setCatchHandler, setDefaultHandler } from "workbox-routing";
import { NetworkOnly, StaleWhileRevalidate } from "workbox-strategies";

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
  const appPathsWithRedirects = appPaths.map((p: string) => {
    const paths = [p];
    if (!p.endsWith("/")) {
      paths.push(p + "/");
    }
    return paths;
  }).flatten()
  const allPaths: string[] = staticPaths.concat(appPathsWithRedirects);
  const pathSet = new Set(allPaths);
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  for (const key of keys) {
    if (!pathSet.has(new URL(key.url).pathname)) {
      await cache.delete(key);
    }
  }
  await cache.addAll(
    allPaths.map((path) => new Request(path, {
      headers: { "X-Preload": "true" },
      redirect: path.endsWith("/")
    })),
  );
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
    const body = fallbackResponse?.body || "Unable to fall back to offline mode.";
    return new Response(body, {
      status: 408,
      headers: {
        "Content-Type": fallbackResponse?.headers.get("Content-Type") || "text/plain",
      },
    });
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
  const staleWhileRevalidate = new StaleWhileRevalidate({
    cacheName: CACHE_NAME,
  });
  const networkOnly = new NetworkOnly();
  for (const path of appPaths) {
    const match = path
      .split("/")
      .map((x) => (x.startsWith("__") ? "[^/]+" : x))
      .join("/");
    const regex = new RegExp(`^(:?https?://[^/]+)?${match}/?$`);
    registerRoute(
      ({ url }) => {
        return regex.test(url.href);
      },
      async (opts) => {
        // When requesting an app path, we ideally get a server-rendered, full
        // response. If that doesn't work, we fall back to a shell page and
        // try to do client-side rendering with offline cached data.
        //
        // In either case, we want to make sure that the shell page gets
        // updated reasonably often. It doesn't always have to be the latest,
        // but we try and keep it fresh by always requesting (and caching) the
        // shell, even if the server-rendered request succeeded.
        const shellUrl = new URL(opts.url.href);
        shellUrl.pathname = path;
        const shellReq = new Request(path);
        const shellResponsePromise = staleWhileRevalidate.handle({
          ...opts,
          request: shellReq,
          url: shellUrl,
        });

        // Let's try to get the full server-rendered response first.
        try {
          const res = await networkOnly.handle(opts);
          if (res.ok) {
            return res;
          }
          // eslint-disable-next-line
        } catch (e) {
          // Fall through...
        }

        // If the network request fails, we fall back to the cached response,
        // under the "default" route which returns the page shell, without
        // param-specific data.
        return shellResponsePromise;
      },
    );
  }
}

function routePostRequests() {
  registerRoute(() => true, offlineFallback, "POST");
}
