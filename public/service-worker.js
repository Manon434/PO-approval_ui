const CACHE_VERSION = "pop-approval-v3";
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const OFFLINE_URL = "/offline.html";
const PRECACHE_URLS = ["/", OFFLINE_URL, "/manifest.webmanifest", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isApiRequest(request) {
  return new URL(request.url).pathname.startsWith("/api");
}

function isStaticAsset(request) {
  const { pathname } = new URL(request.url);
  return pathname.startsWith("/assets/") || pathname.startsWith("/icons/") || pathname === "/manifest.webmanifest";
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || isApiRequest(request)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(APP_SHELL_CACHE).then((cache) => cache.put("/", responseClone));
          return response;
        })
        .catch(() => caches.match("/") || caches.match(OFFLINE_URL))
    );
    return;
  }

  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const networkResponse = fetch(request)
          .then((response) => {
            const responseClone = response.clone();
            caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, responseClone));
            return response;
          })
          .catch(() => cachedResponse);

        return cachedResponse || networkResponse;
      })
    );
  }
});
