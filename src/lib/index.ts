import * as Blockly from "blockly";
import * as zhHans from "blockly/msg/zh-hans";
import { registerFieldMultilineInput } from "@blockly/field-multilineinput";
import blockArray from "./blocks.yml";

Blockly.setLocale(zhHans as any);
Blockly.defineBlocksWithJsonArray(blockArray);
registerFieldMultilineInput();
