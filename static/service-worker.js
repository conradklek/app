const cacheName = "cache"
const cacheFiles = []

self.addEventListener("install", (event) => {
	event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(cacheFiles)))
})

self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => response || fetch(event.request))
	)
})
