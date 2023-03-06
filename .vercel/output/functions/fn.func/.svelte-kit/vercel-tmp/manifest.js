export const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".DS_Store","favicon.png","img/icon-192.png","img/icon-512.png","manifest.json","service-worker.js"]),
	mimeTypes: {".png":"image/png",".json":"application/json",".js":"application/javascript"},
	_: {
		client: {"start":{"file":"_app/immutable/entry/start.24812746.js","imports":["_app/immutable/entry/start.24812746.js","_app/immutable/chunks/index.a741111b.js","_app/immutable/chunks/singletons.66ec26ab.js","_app/immutable/chunks/index.9f2e7d1c.js"],"stylesheets":[],"fonts":[]},"app":{"file":"_app/immutable/entry/app.71e86603.js","imports":["_app/immutable/entry/app.71e86603.js","_app/immutable/chunks/preload-helper.41c905a7.js","_app/immutable/chunks/index.a741111b.js"],"stylesheets":[],"fonts":[]}},
		nodes: [
			() => import('../output/server/nodes/0.js'),
			() => import('../output/server/nodes/1.js'),
			() => import('../output/server/nodes/2.js'),
			() => import('../output/server/nodes/3.js'),
			() => import('../output/server/nodes/4.js'),
			() => import('../output/server/nodes/5.js')
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 3 },
				endpoint: null
			},
			{
				id: "/$",
				pattern: /^\/\$\/?$/,
				params: [],
				page: { layouts: [0,2], errors: [1,,], leaf: 4 },
				endpoint: () => import('../output/server/entries/endpoints/_/_server.js')
			},
			{
				id: "/$/[...path]",
				pattern: /^\/\$(?:\/(.*))?\/?$/,
				params: [{"name":"path","optional":false,"rest":true,"chained":true}],
				page: { layouts: [0,2], errors: [1,,], leaf: 5 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
};
