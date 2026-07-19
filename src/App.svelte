<script lang="ts">
	import { resource } from "runed";
	import Workspace from "./lib/Workspace.svelte";

	let compiledCode = $state("");
	let compileError = $state("");

	const executeResource = resource(
		() => compiledCode,
		async (cmd, _, { signal }) => {
			const res = await fetch(`https://api.hongbot.icu/tianzi`, {
				signal,
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ cmd }),
			});
			const data = await res.json();
			return data.msg;
		},
	);
</script>

<section>
	<Workspace bind:value={compiledCode} bind:error={compileError} />
	<div id="outputDiv" style="top: 0;">
		{#if compileError}
			<pre><code class="error">{compileError}</code></pre>
		{:else if compiledCode}
			<pre><code>{compiledCode}</code></pre>
		{/if}
		{#if executeResource.error}
			<pre><code class="error">{executeResource.error}</code></pre>
		{:else if executeResource.current}
			<pre><code>{executeResource.current}</code></pre>
		{/if}
	</div>
</section>

<style>
	#outputDiv {
		position: fixed;
		right: 0;
		margin: 1em;
		max-width: 50vw;
		max-height: 40vh;
		overflow: auto;
		user-select: none;
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: 0.5em;
	}

	code {
		user-select: text;
	}

	.error {
		color: red;
	}
</style>
