<script lang="ts">
	// import "@yaml-js/types";
	import * as Blockly from "blockly";
	import * as zhHans from "blockly/msg/zh-hans";
	import toolbox from "./lib/toolbox.yml";
	import blockArray from "./lib/blocks.yml";
	import { Generator } from "./lib/generator";
	import { registerFieldMultilineInput } from "@blockly/field-multilineinput";

	registerFieldMultilineInput();

	Blockly.setLocale(zhHans as any);
	const blocks = Blockly.common.createBlockDefinitionsFromJsonArray(blockArray);
	Blockly.common.defineBlocks(blocks);

	let compiledCode = $state("");
	let compileError = $state("");

	function translate(text: string) {
		return fetch(`https://tianzi.pbhh.net/translate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text }),
		});
	}
</script>

<section>
	<div
		id="blocklyDiv"
		{@attach (blocklyDiv) => {
			const workspace = Blockly.inject(blocklyDiv, { toolbox });
			workspace.addChangeListener((event) => {
				if (event.isUiEvent) return;
				try {
					compiledCode = Generator.workspaceToCode(workspace);
					compileError = "";
				} catch (error: any) {
					compileError = error.message;
				}
			});
		}}
	></div>
	<div id="outputDiv" style="top: 0;">
		{#if compileError}
			<pre style="color: red"><code>{compileError}</code></pre>
		{:else if compiledCode}
			<pre><code>{compiledCode}</code></pre>
		{/if}
	</div>
	<div id="resultDiv" style="bottom: 0;">
		{#await translate(compiledCode).then((res) => res.json())}
			<p>...translating</p>
		{:then result}
			<pre><code>{result.translated}</code></pre>
		{:catch error}
			<pre style="color: red"><code>{error}</code></pre>
		{/await}
	</div>
</section>

<style>
	#blocklyDiv {
		height: 100vh;
		width: 100vw;
	}

	#outputDiv,
	#resultDiv {
		position: fixed;
		right: 0;
		margin: 0.5em;
		max-width: 50vw;
		max-height: 40vh;
		overflow: auto;
		user-select: none;
	}

	code {
		user-select: text;
	}
</style>
