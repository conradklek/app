export const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".DS_Store","favicon.png","img/icon-192.png","img/icon-512.png","manifest.json","service-worker.js"]),
	mimeTypes: {".png":"image/png",".json":"application/json",".js":"application/javascript"},
	_: {
		client: {"start":{"file":"_app/immutable/entry/start.e9e4360a.js","imports":["_app/immutable/entry/start.e9e4360a.js","_app/immutable/chunks/index.ca81ac94.js","_app/immutable/chunks/singletons.a1fa200f.js","_app/immutable/chunks/index.93ba9ac1.js"],"stylesheets":[],"fonts":[]},"app":{"file":"_app/immutable/entry/app.d3a61d62.js","imports":["_app/immutable/entry/app.d3a61d62.js","_app/immutable/chunks/preload-helper.41c905a7.js","_app/immutable/chunks/index.ca81ac94.js"],"stylesheets":[],"fonts":[]}},
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
