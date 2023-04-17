<script>
	import { _logo, _caret } from "$lib/assets/svg"
</script>

<div class="bg-[hsl(240DEG,6%,6%)]">
	<header class="absolute inset-x-0 top-0 z-50 h-28">
		<nav class="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
			<div class="flex lg:flex-1">
				<a href="/" class="-m-1.5 p-1.5">
					<span class="sr-only">Sentience</span>
					<img class="h-20 w-auto -my-4" src={_logo} alt="Sentience" />
				</a>
			</div>
			<div class="hidden lg:flex lg:flex-1 lg:justify-end">
				<a href="/ai" class="ml-auto leading-6 w-auto h-8 px-4 flex items-center justify-center gap-2 rounded-full ring-1 ring-white ring-inset">
					Create your Agency
					<img alt="caret" src={_caret} class="block w-2 h-auto" />
				</a>
			</div>
		</nav>
	</header>
	<main>
		<div class="relative isolate overflow-hidden">
			<svg class="absolute inset-0 -z-10 h-full w-full stroke-[hsl(240DEG,3%,8%)] [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
				<defs>
					<pattern id="983e3e4c-de6d-4c3f-8d64-b9761d1534cc" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
						<path d="M.5 200V.5H200" fill="none" />
					</pattern>
				</defs>
				<svg x="50%" y="-1" class="overflow-visible fill-[hsl(240DEG,7%,6.5%)]">
					<path d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z" stroke-width="0" />
				</svg>
				<rect width="100%" height="100%" stroke-width="0" fill="url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)" />
			</svg>
			<div class="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]" aria-hidden="true">
				<div class="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-[#3200FF] to-[#3200FF] opacity-40" style="clip-path: polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)" />
			</div>
			<div class="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-20 lg:flex lg:px-8 lg:pt-20 lg:pb-14">
				<div class="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-2xl lg:pt-8">
					<div class="mt-24 sm:mt-32 lg:mt-16">
						<a href="/ai" class="inline-flex space-x-3 whitespace-nowrap">
							<span class="rounded-full bg-[hsla(254DEG,100%,50%,.25)] px-3 py-1 text-sm tracking-wide leading-6 text-[hsl(256DEG,100%,48%)] ring-1 ring-inset ring-[hsla(254DEG,100%,50%,.5)] shadow-lg shadow-[hsla(254DEG,100%,50%,.15)]">Sentience</span>
							<span class="inline-flex items-center space-x-2 text-sm leading-6 text-[hsl(240DEG,12%,32%)]">
								<span>Svelte Hackathon Project</span>
								<img alt="caret" src={_caret} class="w-4 h-4" />
							</span>
						</a>
					</div>
					<h1 class="mt-10 text-5xl font-thin text-white sm:text-7xl select-none" style="font-family: 'PP Editorial Old', serif;">Creating meaningful human computer interaction.</h1>
					<p class="mt-6 text-lg leading-8">
						In participation with the 2023 Svelte Hackathon. <br />Built using
						<a href="https://vercel.com/" class="underline">Vercel</a>, <a href="https://kit.svelte.dev/docs/introduction" class="underline">SvelteKit</a>, <a href="https://tailwindcss.com/" class="underline">Tailwind CSS</a> &amp; <a href="https://openai.com/" class="underline">OpenAI</a>
					</p>
				</div>
				<div class="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-12 lg:max-w-none lg:flex-none xl:ml-32 saturate-0 opacity-80">
					<div class="max-w-3xl flex-none sm:max-w-5xl lg:max-w-xl rounded-lg overflow-hidden ring-1 ring-[hsl(240DEG,7%,16%)]">
						<img src="/img/computer.png" alt="App screenshot" class="bg-cover opacity-75 contrast-[115%] max-h-96 sm:max-h-none" />
					</div>
				</div>
			</div>
		</div>
		<div class="mx-auto mt-32 max-w-7xl px-6 lg:px-8">
			<div class="mx-auto max-w-2xl text-center">
				<h2 class="text-base leading-7 text-[hsl(256DEG,100%,48%)]">Sentient AI Agents</h2>
				<p class="mt-2 text-5xl font-thin text-white sm:text-7xl" style="font-family: 'PP Editorial Old', serif;">Sentience As A Service</p>
				<p class="mt-6 text-lg leading-8">A unique platform for creating and deploying your custom own AI agents.</p>
			</div>
			<div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
				<dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
					<div class="flex flex-col">
						<dt class="text-base tracking-wide leading-7 text-white">Open Source</dt>
						<dd class="mt-1 flex flex-auto flex-col text-base leading-7">
							<p class="flex-auto text-[hsl(240DEG,12%,32%)]">
								Committed to building in public. View the source code and contribute to the project via the public <a href="https://github.com/conradklek/app" class="text-[hsl(240DEG,6%,56%)] underline">GitHub Repository</a>
							</p>
						</dd>
					</div>
					<div class="flex flex-col">
						<dt class="text-base tracking-wide leading-7 text-white">Free to use</dt>
						<dd class="mt-1 flex flex-auto flex-col text-base leading-7">
							<p class="flex-auto text-[hsl(240DEG,12%,32%)]">
								Your agents are stored locally on your device. Open the <a href="/ai" class="text-[hsl(240DEG,6%,56%)] underline">Agent Dashboard</a> and start creating unique experiences.
							</p>
						</dd>
					</div>
					<div class="flex flex-col">
						<dt class="text-base tracking-wide leading-7 text-white">Thoughtfully Designed</dt>
						<dd class="mt-1 flex flex-auto flex-col text-base leading-7">
							<p class="flex-auto text-[hsl(240DEG,12%,32%)]">Programs designed with people in mind. Don't let bad UI be a barrier to your creativity.</p>
						</dd>
					</div>
				</dl>
			</div>
		</div>
		<div class="mt-32 sm:mt-56">
			<div class="mx-auto max-w-7xl px-6 lg:px-8">
				<div class="mx-auto max-w-2xl sm:text-center">
					<h2 class="text-base leading-7 text-[hsl(256DEG,100%,48%)]">Sentient AI Agents</h2>
					<p class="mt-2 text-5xl font-thin text-white sm:text-7xl" style="font-family: 'PP Editorial Old', serif;">Landing on the devices nearest you.</p>
					<p class="mt-6 text-lg leading-8 text-[hsl(240DEG,12%,32%)]">Install the PWA to use the app directly from your desktop or mobile home screen. No need to open a browser or install an app from the app store.</p>
				</div>
			</div>
			<div class="relative overflow-hidden pt-16">
				<div class="mx-auto max-w-7xl px-6 lg:px-8">
					<img src="/img/screens.png" alt="App screenshot" class="mb-[-12%] brightness-90 contrast-[110%]" />
					<div class="relative" aria-hidden="true">
						<div class="absolute -inset-x-20 bottom-0 bg-gradient-to-t from-[#3200FF25] via-75% via-[#3200FF05] pt-[7%]" />
					</div>
				</div>
			</div>
			<div class="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
				<dl class="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
					<div class="relative pl-9">
						<dt class="inline font-medium text-white">
							<svg class="absolute left-1 top-1 h-5 w-5 text-[hsl(256DEG,100%,48%)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path d="M4.632 3.533A2 2 0 016.577 2h6.846a2 2 0 011.945 1.533l1.976 8.234A3.489 3.489 0 0016 11.5H4c-.476 0-.93.095-1.344.267l1.976-8.234z" />
								<path fill-rule="evenodd" d="M4 13a2 2 0 100 4h12a2 2 0 100-4H4zm11.24 2a.75.75 0 01.75-.75H16a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75V15zm-2.25-.75a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75H13a.75.75 0 00.75-.75V15a.75.75 0 00-.75-.75h-.01z" clip-rule="evenodd" />
							</svg>
							Local Storage.
						</dt>
						<dd class="inline">Your agency is managed by IndexedDB. Your agents are stored locally on your device.</dd>
					</div>
					<div class="relative pl-9">
						<dt class="inline font-medium text-white">
							<svg class="absolute left-1 top-1 h-5 w-5 text-[hsl(256DEG,100%,48%)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
							</svg>
							Privacy First.
						</dt>
						<dd class="inline">We don't collect any data. We don't track you. We don't sell your data. We don't even have a database.</dd>
					</div>
					<div class="relative pl-9">
						<dt class="inline font-medium text-white">
							<svg class="absolute left-1 top-1 h-5 w-5 text-[hsl(256DEG,100%,48%)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path fill-rule="evenodd" d="M10 2.5c-1.31 0-2.526.386-3.546 1.051a.75.75 0 01-.82-1.256A8 8 0 0118 9a22.47 22.47 0 01-1.228 7.351.75.75 0 11-1.417-.49A20.97 20.97 0 0016.5 9 6.5 6.5 0 0010 2.5zM4.333 4.416a.75.75 0 01.218 1.038A6.466 6.466 0 003.5 9a7.966 7.966 0 01-1.293 4.362.75.75 0 01-1.257-.819A6.466 6.466 0 002 9c0-1.61.476-3.11 1.295-4.365a.75.75 0 011.038-.219zM10 6.12a3 3 0 00-3.001 3.041 11.455 11.455 0 01-2.697 7.24.75.75 0 01-1.148-.965A9.957 9.957 0 005.5 9c0-.028.002-.055.004-.082a4.5 4.5 0 018.996.084V9.15l-.005.297a.75.75 0 11-1.5-.034c.003-.11.004-.219.005-.328a3 3 0 00-3-2.965zm0 2.13a.75.75 0 01.75.75c0 3.51-1.187 6.745-3.181 9.323a.75.75 0 11-1.186-.918A13.687 13.687 0 009.25 9a.75.75 0 01.75-.75zm3.529 3.698a.75.75 0 01.584.885 18.883 18.883 0 01-2.257 5.84.75.75 0 11-1.29-.764 17.386 17.386 0 002.078-5.377.75.75 0 01.885-.584z" clip-rule="evenodd" />
							</svg>
							Unique Experience.
						</dt>
						<dd class="inline">Every agent is unique, defined by your own system message and a set of controls. Create an agent for any task.</dd>
					</div>
				</dl>
			</div>
		</div>
		<div class="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
			<div class="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
				<h2 class="text-base tracking-wide leading-8 text-[hsl(256DEG,100%,48%)]">Sentient AI Agents</h2>
				<p class="mt-2 text-4xl font-thin text-white sm:text-6xl" style="font-family: 'PP Editorial Old', serif;">State Of The Art</p>
				<p class="mt-6 text-lg leading-8">Created using the latest and greatest technologies. Constantly updated to ensure the best possible experience.</p>
			</div>
			<dl class="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 text-white sm:mt-20 sm:grid-cols-2 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4">
				<div class="flex flex-col gap-y-3 border-l border-[hsl(240DEG,3%,8%)] pl-6">
					<dt class="text-sm leading-6">Deployment and Hosting</dt>
					<dd class="order-first text-4xl sm:text-6xl font-thin" style="font-family: 'PP Editorial Old', serif;">Vercel</dd>
				</div>
				<div class="flex flex-col gap-y-3 border-l border-[hsl(240DEG,3%,8%)] pl-6">
					<dt class="text-sm leading-6">Full Stack Framework</dt>
					<dd class="order-first text-4xl sm:text-6xl font-thin" style="font-family: 'PP Editorial Old', serif;">SvelteKit</dd>
				</div>
				<div class="flex flex-col gap-y-3 border-l border-[hsl(240DEG,3%,8%)] pl-6">
					<dt class="text-sm leading-6">Powered by GPT-4</dt>
					<dd class="order-first text-4xl sm:text-6xl font-thin" style="font-family: 'PP Editorial Old', serif;">OpenAI</dd>
				</div>
				<div class="flex flex-col gap-y-3 border-l border-[hsl(240DEG,3%,8%)] pl-6">
					<dt class="text-sm leading-6">(the developer)</dt>
					<dd class="order-first text-4xl sm:text-6xl font-thin" style="font-family: 'PP Editorial Old', serif;">Conrad</dd>
				</div>
			</dl>
		</div>
		<div class="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8">
			<svg class="absolute inset-0 -z-10 h-full w-full stroke-[hsl(240DEG,3%,8%)] [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
				<defs>
					<pattern id="1d4240dd-898f-445f-932d-e2872fd12de3" width="200" height="200" x="50%" y="0" patternUnits="userSpaceOnUse">
						<path d="M.5 200V.5H200" fill="none" />
					</pattern>
				</defs>
				<svg x="50%" y="0" class="overflow-visible fill-[hsl(240DEG,7%,5%)]">
					<path d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z" stroke-width="0" />
				</svg>
				<rect width="100%" height="100%" stroke-width="0" fill="url(#1d4240dd-898f-445f-932d-e2872fd12de3)" />
			</svg>
			<div class="absolute inset-x-0 top-10 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl" aria-hidden="true">
				<div class="aspect-[1108/632] w-[69.25rem] flex-none bg-gradient-to-r from-[#3200FF] to-[#3200FF] opacity-30" style="clip-path: polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)" />
			</div>
			<div class="mx-auto max-w-2xl text-center">
				<h2 class="text-5xl font-thin text-white sm:text-7xl" style="font-family: 'PP Editorial Old', serif;">You need to try this.</h2>
				<p class="mx-auto mt-6 max-w-xl text-lg leading-8">A new way to interact with the world’s most advanced AI. It’s so easy to use, you'll be amazed.</p>
				<div class="mt-10 flex items-center justify-center gap-x-6">
					<a href="/ai" class="inline-flex space-x-3 whitespace-nowrap">
						<span class="rounded-full bg-[hsla(254DEG,100%,50%,.25)] px-3 py-1 text-sm tracking-wide leading-6 text-[hsl(256DEG,100%,48%)] ring-1 ring-inset ring-[hsla(254DEG,100%,50%,.5)] shadow-lg shadow-[hsla(254DEG,100%,50%,.15)]">Sentience</span>
						<span class="inline-flex items-center space-x-2 text-sm leading-6 text-[hsl(240DEG,12%,32%)]">
							<span>Svelte Hackathon Project</span>
							<img alt="caret" src={_caret} class="w-4 h-4" />
						</span>
					</a>
				</div>
			</div>
		</div>
	</main>
	<footer class="mx-auto mt-40 max-w-7xl overflow-hidden px-6 pb-20 sm:mt-64 sm:pb-24 lg:px-8">
		<div class="mb-10 flex justify-center space-x-10">
			<a href="https://www.linkedin.com/in/conradklek/" div class="grid place-items-center">
				<svg class="w-auto h-6 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" /></svg>
			</a>
			<a href="https://github.com/conradklek/" class="grid place-items-center">
				<svg class="w-auto h-6 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
					><path
						d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM277.3 415.7c-8.4 1.5-11.5-3.7-11.5-8 0-5.4.2-33 .2-55.3 0-15.6-5.2-25.5-11.3-30.7 37-4.1 76-9.2 76-73.1 0-18.2-6.5-27.3-17.1-39 1.7-4.3 7.4-22-1.7-45-13.9-4.3-45.7 17.9-45.7 17.9-13.2-3.7-27.5-5.6-41.6-5.6-14.1 0-28.4 1.9-41.6 5.6 0 0-31.8-22.2-45.7-17.9-9.1 22.9-3.5 40.6-1.7 45-10.6 11.7-15.6 20.8-15.6 39 0 63.6 37.3 69 74.3 73.1-4.8 4.3-9.1 11.7-10.6 22.3-9.5 4.3-33.8 11.7-48.3-13.9-9.1-15.8-25.5-17.1-25.5-17.1-16.2-.2-1.1 10.2-1.1 10.2 10.8 5 18.4 24.2 18.4 24.2 9.7 29.7 56.1 19.7 56.1 19.7 0 13.9.2 36.5.2 40.6 0 4.3-3 9.5-11.5 8-66-22.1-112.2-84.9-112.2-158.3 0-91.8 70.2-161.5 162-161.5S388 165.6 388 257.4c.1 73.4-44.7 136.3-110.7 158.3zm-98.1-61.1c-1.9.4-3.7-.4-3.9-1.7-.2-1.5 1.1-2.8 3-3.2 1.9-.2 3.7.6 3.9 1.9.3 1.3-1 2.6-3 3zm-9.5-.9c0 1.3-1.5 2.4-3.5 2.4-2.2.2-3.7-.9-3.7-2.4 0-1.3 1.5-2.4 3.5-2.4 1.9-.2 3.7.9 3.7 2.4zm-13.7-1.1c-.4 1.3-2.4 1.9-4.1 1.3-1.9-.4-3.2-1.9-2.8-3.2.4-1.3 2.4-1.9 4.1-1.5 2 .6 3.3 2.1 2.8 3.4zm-12.3-5.4c-.9 1.1-2.8.9-4.3-.6-1.5-1.3-1.9-3.2-.9-4.1.9-1.1 2.8-.9 4.3.6 1.3 1.3 1.8 3.3.9 4.1zm-9.1-9.1c-.9.6-2.6 0-3.7-1.5s-1.1-3.2 0-3.9c1.1-.9 2.8-.2 3.7 1.3 1.1 1.5 1.1 3.3 0 4.1zm-6.5-9.7c-.9.9-2.4.4-3.5-.6-1.1-1.3-1.3-2.8-.4-3.5.9-.9 2.4-.4 3.5.6 1.1 1.3 1.3 2.8.4 3.5zm-6.7-7.4c-.4.9-1.7 1.1-2.8.4-1.3-.6-1.9-1.7-1.5-2.6.4-.6 1.5-.9 2.8-.4 1.3.7 1.9 1.8 1.5 2.6z"
					/></svg
				>
			</a>
			<a href="https://twitter.com/conradklek" class="grid place-items-center">
				<svg class="w-auto h-6 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-48.9 158.8c.2 2.8.2 5.7.2 8.5 0 86.7-66 186.6-186.6 186.6-37.2 0-71.7-10.8-100.7-29.4 5.3.6 10.4.8 15.8.8 30.7 0 58.9-10.4 81.4-28-28.8-.6-53-19.5-61.3-45.5 10.1 1.5 19.2 1.5 29.6-1.2-30-6.1-52.5-32.5-52.5-64.4v-.8c8.7 4.9 18.9 7.9 29.6 8.3a65.447 65.447 0 0 1-29.2-54.6c0-12.2 3.2-23.4 8.9-33.1 32.3 39.8 80.8 65.8 135.2 68.6-9.3-44.5 24-80.6 64-80.6 18.9 0 35.9 7.9 47.9 20.7 14.8-2.8 29-8.3 41.6-15.8-4.9 15.2-15.2 28-28.8 36.1 13.2-1.4 26-5.1 37.8-10.2-8.9 13.1-20.1 24.7-32.9 34z" /></svg>
			</a>
		</div>
		<p class="mt-10 text-center text-xs leading-5 text-[hsl(240DEG,12%,32%)]"><span class="font-light">&copy;</span> {new Date().getFullYear()} Sentient AI Agency &middot; All rights reserved</p>
	</footer>
</div>
