const CACHE_NAME = "book-builder-v1";

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache
				.addAll(["/", "/favicon.ico", "/globals.css"])
				.catch((err) => {
					console.log("Failed to pre-cache minimal assets", err);
				});
		}),
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cache) => {
					if (cache !== CACHE_NAME) {
						return caches.delete(cache);
					}
				}),
			);
		}),
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	if (!event.request.url.startsWith(self.location.origin)) {
		return;
	}

	// Skip API calls - let React Query handle data persistence
	if (event.request.url.includes("/api/")) {
		return;
	}

	const url = new URL(event.request.url);

	// Strategy for HTML pages (Navigation): Stale-While-Revalidate or Network First
	// For offline reading, we want Network First, falling back to Cache, AND caching the result.
	if (event.request.mode === "navigate") {
		event.respondWith(
			fetch(event.request)
				.then((response) => {
					// Cache the fresh page
					const responseToCache = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseToCache);
					});
					return response;
				})
				.catch(() => {
					// Fallback to cache if offline
					return caches.match(event.request);
				}),
		);
		return;
	}

	// Strategy for Assets (JS/CSS/Images): Cache First
	// Check cache -> Return if found -> Else Network -> Cache result -> Return
	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			if (cachedResponse) {
				return cachedResponse;
			}

			return fetch(event.request).then((networkResponse) => {
				// Cache valid responses for static assets
				if (
					!networkResponse ||
					networkResponse.status !== 200 ||
					networkResponse.type !== "basic"
				) {
					return networkResponse;
				}

				// Cache Next.js static assets and common image types
				if (
					url.pathname.startsWith("/_next/") ||
					url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico)$/)
				) {
					const responseToCache = networkResponse.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseToCache);
					});
				}

				return networkResponse;
			});
		}),
	);
});
