import { build, files, prerendered, version } from "$service-worker"

const worker = self
const FILES = `cache-${version}`

const toCache = [...build, ...files, ...prerendered]

worker.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(FILES)
			.then((cache) => cache.addAll(toCache))
			.then(() => worker.skipWaiting())
	)
})

worker.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			for (const key of keys) if (key !== FILES) await caches.delete(key)
		})
	)
})
