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
</script>

<section>
	<div id="blocklyDiv" bind:this={blocklyDiv}></div>
	<pre id="outputDiv">
		<code class={errorMsg && "error"}>{errorMsg || outputCode}</code>
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

	.error {
		color: red;
	}

	code {
		user-select: text;
	}
</style>
