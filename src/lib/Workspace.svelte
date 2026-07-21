<script module>
  import "."
</script>

<script lang="ts">
  import * as Blockly from "blockly";
  import Generator from "./generator";
  let {
    value = $bindable<string>(),
    error = $bindable<string>(),
    ...props
  } = $props();
</script>

<div
  style="height: 100vh; width: 100vw;"
  {@attach (blocklyDiv) => {
    const workspace = Blockly.inject(blocklyDiv, {
      grid: { colour: "#f0f0f0", length: 12, snap: true, spacing: 32 },
      move: { drag: true, scrollbars: true, wheel: true },
      zoom: { controls: true, pinch: true, wheel: true },
      ...props,
    });
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
