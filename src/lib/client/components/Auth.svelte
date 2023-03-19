<script>
	import { goto } from "$app/navigation"
	import localforage from "localforage"
	async function signup(e) {
		e.preventDefault()
		try {
			const response = await fetch("/", {
				method: "POST",
				body: new FormData(e.target)
			})
			if (!response.ok) {
				throw new Error(await response.text())
			}
			const json = await response.json()
			if (json.status === 200) {
				await localforage.setItem("indexedDB", {})
				goto("/")
			}
		} catch (error) {
			console.log(error)
		}
	}
	async function login(e) {
		e.preventDefault()
		try {
			const response = await fetch("/", {
				method: "POST",
				body: new FormData(e.target)
			})
			if (!response.ok) {
				throw new Error(await response.text())
			}
			const json = await response.json()
			if (json.status === 200) {
				await localforage.setItem("indexedDB", json.data.user.data || {})
				goto("/")
			}
		} catch (error) {
			console.log(error)
		}
	}
</script>

<div id="auth">
	<form on:submit={login}>
		<input type="hidden" name="action" value="login" />
		<label for="email">Email</label>
		<input type="email" id="email" name="email" />
		<label for="password">Password</label>
		<input type="password" id="password" name="password" />
		<button type="submit">Login</button>
	</form>
	<form on:submit={signup}>
		<input type="hidden" name="action" value="signup" />
		<label for="signupEmail">Email</label>
		<input type="email" id="signupEmail" name="email" />
		<label for="signupUsername">Username</label>
		<input type="text" id="signupUsername" name="username" />
		<label for="signupPassword">Password</label>
		<input type="password" id="signupPassword" name="password" />
		<button type="submit">Signup</button>
	</form>
</div>
