<script module>
  import * as Blockly from "blockly";
  import * as zhHans from "blockly/msg/zh-hans";
  import toolbox from "./toolbox.yml";
  import blockArray from "./blocks.yml";
  import Generator from "./generator";
  import { registerFieldMultilineInput } from "@blockly/field-multilineinput";

  registerFieldMultilineInput();
  Blockly.setLocale(zhHans as any);

  const blocks = Blockly.common.createBlockDefinitionsFromJsonArray(blockArray);
  Blockly.common.defineBlocks(blocks);
</script>

<script lang="ts">
  let { value = $bindable<string>(), error = $bindable<string>() } = $props();
</script>

<div
  style="height: 100vh; width: 100vw;"
  {@attach (blocklyDiv) => {
    const workspace = Blockly.inject(blocklyDiv, { toolbox });
    workspace.addChangeListener((event) => {
      if (event.isUiEvent) return;
      try {
        value = Generator.workspaceToCode(workspace);
        error = "";
      } catch (error: any) {
        error = error.message;
      }
    });
  }}
></div>
