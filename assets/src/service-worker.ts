// This is the general service worker for the app. It covers both the site
// part and the app part.
/// <reference lib="webworker" />

const CACHE_VERSION = "v1";

addEventListener("install", (event: Event) => {
  // @ts-expect-error idk where the service worker specific types are, but this is fine.
  event.waitUntil(addResourcesToCache());
});

async function addResourcesToCache() {
  const response = await fetch("/offline_paths");
  if (!response.ok) {
    throw new Error("Failed to fetch offline paths");
  }
  const offlinePaths = await response.json();
  const cache = await caches.open(CACHE_VERSION);
  await cache.addAll(offlinePaths.paths);
}

addEventListener("activate", (event) => {
  // @ts-expect-error idk where the service worker specific types are, but this is fine.
  event.waitUntil(registration?.navigationPreload.enable());
});

async function putInCache(request: Request, response: Response) {
  const cache = await caches.open(CACHE_VERSION);
  await cache.put(request, response);
}

addEventListener("fetch", (event: Event) => {
  (event as FetchEvent).respondWith(
    responseWithFallback(
      (event as FetchEvent).request,
      (event as FetchEvent).preloadResponse,
    ),
  );
});

async function responseWithFallback(
  request: Request,
  preload: Promise<Response | undefined>,
) {
  try {
    return await fetch(request);
  } catch (e) { // eslint-disable-line
    const resFromCache = await caches.match(request);
    if (resFromCache) {
      return resFromCache;
    }
    try {
      const preloadedRes = await preload;
      if (preloadedRes && preloadedRes.ok) {
        putInCache(request, preloadedRes.clone());
        return preloadedRes;
      }
    } catch (e) {
      console.error("Error on preload:", e);
    }
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
