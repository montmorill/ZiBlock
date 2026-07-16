<script lang="ts">
	// import "@yaml-js/types";
	import * as Blockly from "blockly";
	import toolbox from "./lib/toolbox.yml";
	import blockArray from "./lib/blocks.yml";
	import { Generator } from "./lib/generator";

	const blockDefinitions =
		Blockly.common.createBlockDefinitionsFromJsonArray(blockArray);

	let errorMsg = $state("");
	let outputCode = $state("");
	let blocklyDiv: HTMLDivElement;
	$effect(() => {
		Blockly.common.defineBlocks(blockDefinitions);
		const workspace = Blockly.inject(blocklyDiv, { toolbox });
		workspace.addChangeListener((event) => {
			if (event.isUiEvent) return;
			try {
				outputCode = Generator.workspaceToCode(workspace);
				errorMsg = "";
			} catch (error: any) {
				errorMsg = "Error: " + (error.message || error);
			}
		});
	});

	let evaluateResult = $state("");
	let evaluateError = $state("");
	$effect(() => {
		fetch(`https://tianzi.pbhh.net/translate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text: outputCode }),
		})
			.then((res) => res.json())
			.then(async (res) => {
				evaluateResult = res.translated;
				evaluateError = "";
			})
			.catch((error) => {
				evaluateError = "Error: " + (error.message || error);
			});
	});
</script>

<section>
	<div id="blocklyDiv" bind:this={blocklyDiv}></div>
	<pre id="outputDiv">
		<code class={errorMsg && "error"}>{errorMsg || outputCode}</code>
	</pre>
	<pre id="resultDiv">
		<code class={evaluateError && "error"}>{evaluateError || evaluateResult}</code>
	</pre>
</section>

<style>
	#blocklyDiv {
		height: 100vh;
		width: 100vw;
	}

	#outputDiv {
		position: fixed;
		top: 0;
		right: 0;
		margin: 0.5em;
		user-select: none;
	}

	#resultDiv {
		position: fixed;
		bottom: 0;
		right: 0;
		margin: 0.5em;
		user-select: none;
	}

	.error {
		color: red;
	}

	code {
		user-select: text;
	}
</style>
