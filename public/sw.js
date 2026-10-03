/* VitaSense AI — offline shell (v2) */
const CACHE = "vitasense-v2";
const SHELL = ["/manifest.webmanifest", "/app-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // Purge every old cache so stale app code can never be served again.
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_serverFn")) return;

  // Pages & app code: always go to the network first. Only fall back to the
  // cached copy when fully offline, and never cache HTML pages (they point at
  // versioned scripts, so a stale page breaks the whole app after an update).
  const isPage = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (!isPage && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(async () => {
        const hit = await caches.match(req);
        if (hit) return hit;
        if (isPage) {
          const shell = await caches.match("/");
          if (shell) return shell;
        }
        return new Response("Offline", { status: 503 });
      }),
  );
});
