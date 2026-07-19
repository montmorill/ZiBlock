<script lang="ts">
	import { resource } from "runed";
	import Blockly from "./lib/Blockly.svelte";

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
			const { msg } = await res.json();
			return msg;
		},
	);
</script>

<section>
	<Blockly bind:value={compiledCode} bind:error={compileError} />
	<div id="outputDiv" style="top: 0;">
		{#if compileError}
			<pre><code class="error">{compileError}</code></pre>
		{:else}
			<pre><code>{compiledCode}</code></pre>
		{/if}
	</div>
	<div id="resultDiv" style="bottom: 0;">
		{#if executeResource.error}
			<pre><code class="error">{executeResource.error}</code></pre>
		{:else}
			<pre><code>{executeResource.current}</code></pre>
		{/if}
	</div>
</section>

<style>
	#outputDiv,
	#resultDiv {
		position: fixed;
		right: 0;
		margin: 1em;
		max-width: 50vw;
		max-height: 40vh;
		overflow: auto;
		user-select: none;
	}

	code {
		user-select: text;
	}

	.error {
		color: red;
	}
</style>
