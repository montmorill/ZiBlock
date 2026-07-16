<script lang="ts">
	import * as Blockly from "blockly";
	import * as zhHans from "blockly/msg/zh-hans";
	import toolbox from "./lib/toolbox.yml";
	import blockArray from "./lib/blocks.yml";
	import { Generator } from "./lib/generator";
	import { registerFieldMultilineInput } from "@blockly/field-multilineinput";

	Blockly.setLocale(zhHans as any);

	registerFieldMultilineInput();

	const blocks = Blockly.common.createBlockDefinitionsFromJsonArray(blockArray);
	Blockly.common.defineBlocks(blocks);

	let compiledCode = $state("");
	let compileError = $state("");

	let translatedResult = $state("");
	let translateError = $state("");

	$effect(() => {
		fetch(`https://api.hongbot.icu/tianzi`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ cmd: compiledCode }),
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				translatedResult = data.msg;
				translateError = "";
			})
			.catch((error) => {
				console.log(error);
				translateError = error.message;
			});
	});
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
			<pre><code style="color: red">{compileError}</code></pre>
		{:else}
			<pre><code>{compiledCode}</code></pre>
		{/if}
	</div>
	<div id="resultDiv" style="bottom: 0;">
		{#if translateError}
			<pre><code style="color: red">{translateError}</code></pre>
		{:else}
			<pre><code>{translatedResult}</code></pre>
		{/if}
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
