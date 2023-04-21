<script>
	import { onMount } from "svelte"
	import localforage from "localforage"
	import { _caret, _chat, _command, _file, _folder, _send, _copy } from "$lib/assets/svg"
	import { _mage, _priest, _rogue, _warrior } from "$lib/assets/img"
	import Markdoc from "@markdoc/markdoc"
	function mark(doc) {
		const ast = Markdoc.parse(doc)
		const content = Markdoc.transform(ast)
		const html = Markdoc.renderers.html(content)
		return html
	}
	function scroll_down() {
		queueMicrotask(() => {
			gui.root.scrollTo({
				top: gui.root.scrollHeight,
				behavior: "smooth"
			})
		})
	}
	const img = {
		Mage: _mage,
		Priest: _priest,
		Rogue: _rogue,
		Warrior: _warrior
	}
	$: rpg = {
		focus: "Mage",
		party: [
			{
				class: "Mage",
				health: 100,
				mana: 100,
				level: 1,
				spellbook: []
			},
			{
				class: "Priest",
				health: 100,
				mana: 100,
				level: 1,
				spellbook: []
			},
			{
				class: "Rogue",
				health: 100,
				mana: 100,
				level: 1,
				spellbook: []
			},
			{
				class: "Warrior",
				health: 100,
				mana: 100,
				level: 1,
				spellbook: []
			}
		],
		messages: [],
		encounter: []
	}
	$: gui = {
		side: null,
		root: null,
		tabs: [
			{ slot: "Encounter", selected: true },
			{ slot: "Spellbook", selected: false },
			{ slot: "Campaigns", selected: false }
		],
		area: null
	}
	onMount(async () => {
		const data = await localforage.getItem("RPG")
		rpg = data || rpg
	})
	async function submit() {
		const prompt = gui.area.value
		const focus = rpg.focus
		gui.area.value = ""
		gui.area.focus()
		if (!prompt) return
		rpg.messages.push({
			role: "user",
			content: prompt,
			id: crypto.randomUUID(),
			class: focus
		})
		rpg = rpg
		scroll_down()
		let messages = rpg.messages.map((message) => {
			return {
				role: message.role,
				content: message.role === "user" ? `[${message.class}]:\n${message.content}` : message.content
			}
		})
		console.log(messages)
		let response = await fetch("/ai", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				messages,
				controls: {
					system: `\
Act like you are simulating a Multi-User Simulated Experience (MUSE). Subsequent commands should be interpreted as being sent to the MUSE. The MUSE should allow players navigate the world, interact with NPCs, and battle enemies.

There are four players in this simulation, each playing a particular class — A Mage, a Priest, a Rogue, and a Warrior. The start of each user message will include the [ Class ] so you know who you are talking to.

Players can respond with an ellipsis “...” if they just want the simulated MUSE to progress further without without any actions.

Here is the JSON representation of the current state of each party member:

${JSON.stringify(rpg.party, null, 2)}

You can control the game state by including a JSON object in your response surrounded by a triple back-ticked Markdown code-block.

After players make a move, give the enemies an opportunity to defend and strike back. You can update a player's state by including a JSON object in your response surrounded by a triple back-ticked Markdown code-block. For example:
\`\`\`
{ "target": "Warrior", "health": -10 }
\`\`\`

This will reduce the health of the Warrior by 10

If a player casts a spell, remember to reduce their mana by the amount of mana required to cast the spell. For example:

\`\`\`
{ "target": "Warrior", "mana": -10 }
\`\`\`

This will reduce the mana of the Warrior by 10, assuming the Warrior has a spell that costs 10 mana to cast, and assuming the Warrior has more than the required 10 mana to cast the spell.

\`\`\`
{ "target": "Mage", "spellbook": { name: String, mana: Number, damage: Number, description: String } }
\`\`\`

This will add a new spell to the Mage's spellbook

Only one JSON object is allowed per code-block. If you want to respond with multiple JSON objects, you must include a triple back-ticked code-block for each one.
Only modify properties that both exist and whose values have changed due to the current state of the game, otherwise their state will remain unchanged.

You can introduce enemies and NPCs by including an "encounter" code-block in your response. For example:

\`\`\`
{
	"encounter": [
		{ "name": "Goblin", "health": 10, "mana": 0, "level": 1 },
		{ "name": "Goblin", "health": 10, "mana": 0, "level": 1 }
	]
}
\`\`\`

You may then update the state of the encounter by including a "index" alongside the "target" property in your code-block. For example:

\`\`\`
{ "target": "Goblin", "index": 1, "health": -10 }
\`\`\`

This will reduce the health of the second Goblin by 10. 

You can increase a player's level like so:

\`\`\`
{ "target": "Mage", "level": 1 }
\`\`\`

You should increase every characters level at the end of each battle. Players should be rewarded with a new spell when they level up.

${rpg.encounter.length ? `Here is the the JSON representation of the current encounter:\n${JSON.stringify(rpg.encounter, null, 2)}` : "There is no current encounter."}

We will begin when the first player message is received. When that happens, initiate the campaign by granting each character their first spell and jump right into the first battle.`,
					temperature: 0,
					topP: 1.0,
					frequencyPenalty: 0,
					presencePenalty: 0,
					maxTokens: 4096
				},
				prompt
			})
		})
		let reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
		let message = {
			role: "assistant",
			content: "",
			id: crypto.randomUUID()
		}
		rpg.messages.push(message)
		rpg = rpg
		let stream = ""
		while (true) {
			let { done, value } = await reader.read()
			if (value) {
				stream += value
				message.content += value
				message = message
				rpg = rpg
				scroll_down()
			}
			if (done) {
				console.clear()
				console.log(rpg)
				console.log(gui)
				const regex = /```(?:\s*{[\s\S]*?}\s*|[\s\S]*?\s*{[\s\S]*?}\s*|[\s\S]*?)```/g
				const matches = stream.match(regex)
				console.log(matches)
				if (matches?.length) {
					for (let match of matches) {
						const json = match.replace(/```/g, "").trim()
						console.log(json)
						const data = JSON.parse(json)
						console.log(data)
						if (data.target) {
							let target
							if (rpg.party.map((member) => member.class).includes(data.target)) {
								target = rpg.party.find((member) => member.class === data.target)
							} else if (rpg.encounter.map((member) => member.name).includes(data.target) && data.index !== undefined) {
								target = rpg.encounter[data.index]
							}
							if (data.spellbook) {
								target.spellbook.push(data.spellbook)
								rpg = rpg
							}
							if (data.level) {
								target.level += data.level
								rpg = rpg
							}
							if (data.health || data.mana) {
								if (target) {
									if (data.health) {
										target.health += data.health
										if (target.health > 100) target.health = 100
										if (target.health < 0) target.health = 0
									}
									if (data.mana) {
										target.mana += data.mana
										if (target.mana > 100) target.mana = 100
										if (target.mana < 0) target.mana = 0
									}
								}
								rpg = rpg
							}
						} else if (data.encounter) {
							rpg.encounter = data.encounter
							rpg = rpg
						}
					}
				}
				break
			}
		}
	}
</script>

<div class="relative h-screen flex flex-col overflow-y-auto xl:overflow-y-auto bg-[hsl(240DEG,6%,6%)] xl:bg-[hsl(270DEG,6%,4%)]" class:overflow-y-hidden={gui.side === "right"} bind:this={gui.root}>
	<header class="z-50 sticky top-0 left-0 shrink-0 bg-gradient-to-r from-[hsl(240DEG,6%,6%)] via-[hsla(240DEG,6%,6%,90%)] to-[hsl(240DEG,6%,6%)] ring-1 ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-start px-4 sm:px-6 lg:px-8">
			<a href="/ai" class="grid place-items-center h-8 w-8 rounded-full focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
				<span class="sr-only">AI Home</span>
				<span class="text-lg select-none translate-y-px">⚔️</span>
			</a>
			<nav class="z-0 grid grid-flow-col items-center gap-1.5 pl-1.5">
				<div class="h-8 flex flex-row items-center justify-center pointer-events-none">
					<img alt="caret" src={_caret} class="block w-2 h-auto" />
				</div>
				<div class="block h-8 leading-8 px-2 rounded-sm select-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50 tracking-wide whitespace-nowrap">MUSE</div>
			</nav>
			<div class="flex items-center gap-x-4 ml-auto">
				<button type="button" class="grid place-items-center lg:hidden h-8 w-8 rounded-full cursor-pointer bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" on:click={() => (gui.side = gui.side === "left" ? null : "left")}>
					<img src={_caret} class="block w-2 h-auto -rotate-180 transition-transform duration-200" alt="left side menu toggle" class:rotate-0={gui.side === "left"} />
				</button>
				<button type="button" class="grid place-items-center xl:hidden h-8 w-8 rounded-full cursor-pointer bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50" on:click={() => (gui.side = gui.side === "right" ? null : "right")}>
					<img src={_caret} class="block w-2 h-auto transition-transform duration-200" alt="right side menu toggle" class:-rotate-180={gui.side === "right"} />
				</button>
			</div>
		</div>
	</header>
	<div class="relative z-0 mx-auto flex w-full max-w-7xl items-start gap-x-0 sm:px-6 lg:px-8">
		<aside class="w-60 h-[calc(100vh-4rem)] z-10 fixed lg:sticky top-16 left-0 hidden shrink-0 lg:block overflow-x-hidden overflow-y-auto bg-[hsl(240DEG,6%,6%)] xl:bg-transparent bg-gradient-to-r from-transparent to-[hsl(240DEG,6%,6%)] border-r border-r-[hsl(240DEG,6%,9%)]" class:hidden={gui.side !== "left"}>
			<nav class="flex flex-col pr-2.5 pt-5">
				{#each rpg.party as character (character.class)}
					<div class="flex flex-row -my-3">
						<button
							type="button"
							class="grid place-items-center w-24 aspect-[1/1] rounded-sm overflow-hidden"
							on:click={() => {
								rpg.focus = character.class
							}}
						>
							<img src={img[character.class]} alt="mage" class="w-full object-cover" />
						</button>
						<div class="flex flex-col items-end justify-center w-full h-24 pb-1.5">
							<div class="flex flex-row items-end justify-between w-full h-8 px-1 select-none">
								<div class="text-sm tracking-wide">{character.class}</div>
								<div class="text-xs">level {character.level}</div>
							</div>
							<div class="flex flex-row items-center justify-start w-full h-3.5 mb-px px-1 pt-1.5">
								<div class="h-full bg-red-500/50" style:width="{Math.round((character.health / 100) * 100)}%" />
							</div>
							<div class="flex flex-row items-center justify-start w-full h-3.5 px-1 pb-1.5">
								<div class="h-full bg-blue-500/50" style:width="{Math.round((character.mana / 100) * 100)}%" />
							</div>
						</div>
					</div>
				{/each}
			</nav>
		</aside>
		<main class="z-0 relative flex flex-col items-end justify-end flex-1 shrink-0 min-h-full sm:translate-x-0" class:translate-x-60={gui.side === "left"} class:-traslate-x-96={gui.side === "right"}>
			<ul class="flex flex-col items-start justify-end w-full max-w-[calc(1280px-15rem-24rem)] h-full min-h-[calc(100vh-11rem-4rem)] pb-6 lg:px-3 xl:bg-gradient-to-tl xl:from-[hsl(240DEG,6%,6%)] xl:via-[hsl(240DEG,6%,6%)] xl:via-40% xl:to-transparent overflow-x-auto">
				{#each rpg.messages as message (message.id)}
					{#if message.role === "assistant"}
						<li class="flex flex-row items-start justify-start pr-16">
							<div class="w-12 h-12 m-4 aspect-[1/1] rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50" />
							<div class="text-sm flex flex-col items-start justify-start pt-2.5 pr-4">
								<div class="rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50 mt-2.5 p-0 [&_article]:p-2 [&_article]:prose [&_article]:prose-invert [&_article]:prose-sm [&_pre]:max-w-sm [&_pre]:overflow-x-auto">{@html mark(message.content)}</div>
							</div>
						</li>
					{:else}
						<li class="flex flex-row items-start justify-start ml-auto pl-20">
							<div class="text-sm flex flex-col items-end justify-end pt-2.5 pr-4">
								<div class="rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50 mt-2.5 p-0 [&_article]:p-2 [&_article]:prose [&_article]:prose-invert [&_article]:prose-sm [&_pre]:max-w-sm [&_pre]:overflow-x-auto">{@html mark(message.content)}</div>
							</div>
							<div class="w-12 h-12 m-4 ml-0 aspect-[1/1] rounded-sm ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50">
								<img src={img[message.class]} alt="mage" class="w-full object-cover scale-125" />
							</div>
						</li>
					{/if}
				{/each}
			</ul>
			<form action="/ai" method="POST" class="z-50 sticky bottom-0 right-0 flex flex-col items-end justify-end w-full max-w-5xl h-44 pl-4 sm:pl-0 bg-[hsl(240DEG,6%,6%)] sm:bg-transparent xl:bg-gradient-to-t xl:from-[hsla(240DEG,6%,6%,90%)] xl:via-[hsl(240DEG,6%,6%)] xl:via-40% xl:to-[hsl(240DEG,6%,6%)] xl:border-t xl:border-t-[hsl(240DEG,6%,9%)]" on:submit|preventDefault={submit}>
				<div class="flex flex-row items-center w-full h-44 sm:px-4 md:pr-0 lg:pl-7 xl:pl-7 py-8">
					<label for="prompt" class="w-full h-full flex flex-row items-center justify-center">
						<span class="sr-only">prompt</span>
						<textarea
							id="prompt"
							type="text"
							name="prompt"
							bind:this={gui.area}
							autocomplete="off"
							class="w-full h-full resize-none px-3 py-2.5 focus:outline-none ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] bg-[hsl(240DEG,6%,6%)] shadow shadow-black/50 rounded-sm"
							on:keydown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									submit()
								}
							}}
						/>
					</label>
					<div class="flex flex-row items-center justify-center h-full sm:aspect-[1/1] flex-1 ml-auto px-4 whitespace-nowrap">
						<button type="submit" class="flex items-center justify-center w-10 h-10 rounded-sm whitespace-nowrap focus:outline-none bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
							<img alt="send" src={_send} class="block w-5 h-auto" />
						</button>
					</div>
				</div>
			</form>
		</main>
		<aside class="w-screen sm:w-96 h-[calc(100vh-4rem)] z-10 fixed xl:sticky top-16 right-0 hidden shrink-0 xl:block overflow-x-hidden overflow-y-auto bg-[hsl(240DEG,6%,6%)] xl:bg-transparent bg-gradient-to-l from-transparent via-transparent via-60% to-[hsl(240DEG,6%,6%)] border-l border-l-[hsl(240DEG,6%,9%)]" class:hidden={gui.side !== "right"}>
			{#if rpg.focus}
				{@const character = rpg.party.find((i) => i.class === rpg.focus)}
				<form class="flex flex-col gap-2.5 p-4">
					<div class="flex flex-col items-start justify-start gap-2.5">
						<div class="flex flex-row items-start justify-end gap-2.5 w-full h-full">
							<div class="flex flex-row w-24 h-24 aspect-square rounded-sm bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50">
								<img src={img[rpg.focus]} alt="mage" class="w-full object-cover scale-125" />
							</div>
							<div class="flex flex-col items-end justify-end w-full h-24">
								<div class="flex flex-col items-end justify-center w-full">
									<div class="flex flex-row items-end justify-between whitespace-nowrap w-full h-8 select-none">
										<div class="text-lg font-medium text-[hsl(240DEG,6%,90%)]">{rpg.focus}</div>
										<div class="text-sm tracking-wide">level {character.level}</div>
									</div>
									<div class="flex flex-row items-center justify-start w-full h-3.5 mb-px pt-1.5">
										<div class="h-full bg-red-500/50" style:width="{Math.round((character.health / 100) * 100)}%" />
									</div>
									<div class="flex flex-row items-center justify-start w-full h-3.5 pb-1.5">
										<div class="h-full bg-blue-500/50" style:width="{Math.round((character.mana / 100) * 100)}%" />
									</div>
								</div>
								<div class="w-full h-full flex flex-row items-end justify-end gap-1">
									<div class="flex flex-row items-center gap-x-1.5 w-full">
										{#each gui.tabs as tab, i}
											<button
												type="button"
												class="relative h-8 flex flex-row items-center justify-center text-center whitespace-nowrap select-none px-4 text-sm tracking-wide rounded-sm focus:outline-none overflow-hidden bg-[hsl(240DEG,6%,6%)] ring-1 ring-inset ring-[hsl(240DEG,6%,9%)] shadow shadow-black/50"
												class:w-full={tab.selected}
												class:w-8={!tab.selected}
												on:click={() => {
													gui.tabs.find((i) => i.selected).selected = false
													tab.selected = true
												}}
											>
												{#if tab.selected}
													{tab.slot}
												{:else}
													<div class="absolute top-0 left-0 grid place-items-center text-sm font-medium w-8 h-8">
														{i + 1}
													</div>
												{/if}
											</button>
										{/each}
									</div>
								</div>
							</div>
						</div>
					</div>
				</form>
			{/if}
		</aside>
	</div>
</div>
