import * as Blockly from 'blockly';

export const Symbols = {
  // Symbols
  Head: '[[',
  Tail: ']]',
  Modify: '@',
  Length: '=',
  Cache: '>',

  // Syntaxes
  LingerAssign: '>>>', // SYNtax LingerAssign
  LingerRef: '<<<',
  SliceSep: ':',
  Calculate: '=',
  InnerValAssign: '>>',
  InnerValRef: '<<',
  InnerValField: ':',
  Reference: '<', // 没有 SYN_ASSIGN，用的是 SYM_CACHE
  Font: ':',
  Immediate: '#',
  Repeat: '*',
  RepeatLazy: '**',

  StrictMode: '$$'
}

const Charsets = {
  Range: "-－～—",
  SegSep: ";；|/",
  SplitSep: "，、 ",
  Sep: "，、；？,.; \n",
  // Inline: "\ue104-\ue500",
}

// RCS_SEP = "\\s\\，\\、\\；\\？\\,\\;"  # 此处不用escape是因为\s会被escape转义失效
// RCG_ELLIPSIS = "\\.\\.\\.|\\.\\.\\.\\.\\.\\.|\\…|\\…\\…|\\。\\。\\。|\\-|\\~|\\－|\\～|\\—|\\*"

const phrasesToEscape = Object.values(Symbols);
phrasesToEscape.push('\\', ...Object.values(Charsets)
  .flatMap(chars => chars.split('')));

const casesToEscape = phrasesToEscape.map(RegExp.escape);
casesToEscape.push('\ue104-\ue500');

const escapeRegex = new RegExp('(' + casesToEscape.join('|') + ')', 'g');

function escape(text: string) {
  return text.replaceAll(escapeRegex, fullmatch =>
    Array.from(fullmatch).map(char => '\\' + char).join(''));
}

function translate(text: string | null) {
  return `${Symbols.Head}${text || ''}${Symbols.Tail}`;
}

export const Generator = new Blockly.Generator('tianzi')

const extractCode = (code: string | [string, number]) => {
  return Array.isArray(code) ? code[0] : code;
}

function joinBlock(
  block: Blockly.Block | null,
  sep: string | null = null,
  code: string = extractCode(Generator.blockToCode(block)),
): string {
  const nextBlock = block?.nextConnection?.targetBlock();
  if (sep !== null && nextBlock)
    code += sep + joinBlock(nextBlock, sep);
  return code;
}

function blockToCode(
  block: Blockly.Block | null,
  code: string = extractCode(Generator.blockToCode(block)),
): string {
  return joinBlock(block, '', code);
}

Generator.scrub_ = (block: Blockly.Block, code: string) => {
  if (block.getParent())
    return code;
  return joinBlock(block, '', code);
}

// Text =======================================================================

Generator.forBlock['text_multiline'] =
  Generator.forBlock['text'] = (block: Blockly.Block) => {
    return escape(block.getFieldValue('TEXT'));
  }

Generator.forBlock['translate_multiline'] =
  Generator.forBlock['translate'] = (block: Blockly.Block) => {
    return translate(block.getFieldValue('TEXT'));
  }

Generator.forBlock['translate_block'] = (block: Blockly.Block) => {
  return translate(blockToCode(block.getInputTargetBlock('BODY')));
}

// Math =======================================================================

Generator.forBlock['number'] = (block: Blockly.Block) => {
  const body = block.getFieldValue('BODY');
  return translate(Symbols.Immediate + body);
}

Generator.forBlock['number_block'] = (block: Blockly.Block) => {
  const body = block.getInputTargetBlock('BODY');
  return translate(Symbols.Immediate + blockToCode(body));
}

Generator.forBlock['choice'] = (block: Blockly.Block) => {
  const body = block.getInputTargetBlock('BODY');
  return translate(body && joinBlock(body, ' '));
}

Generator.forBlock['calculate'] = (block: Blockly.Block) => {
  const text = block.getFieldValue('BODY');
  return translate(Symbols.Calculate + text);
}

Generator.forBlock['calculate_block'] = (block: Blockly.Block) => {
  const body = block.getInputTargetBlock('BODY');
  return translate(Symbols.Calculate + blockToCode(body));
}

// Controls ===================================================================

Generator.forBlock['controls_repeat'] = (block: Blockly.Block) => {
  const times = block.getFieldValue('TIMES');
  const body = block.getInputTargetBlock('BODY');
  const lazy = block.getFieldValue('LAZY');
  const symbol = lazy === 'TRUE' ? Symbols.RepeatLazy : Symbols.Repeat;
  return translate(blockToCode(body) + symbol + times);
}

// Variables ==================================================================

Generator.forBlock['variables_set'] = (block: Blockly.Block) => {
  const value = blockToCode(block.getInputTargetBlock('VALUE'));
  const name = block.getField('VAR')!.getText();
  const echo = block.getFieldValue('ECHO') === 'TRUE';
  return translate(value + Symbols.Cache + name + (echo ? Symbols.Cache : ''));
}

Generator.forBlock['variables_set_block'] = (block: Blockly.Block) => {
  const value = blockToCode(block.getInputTargetBlock('VALUE'));
  const name = blockToCode(block.getInputTargetBlock('VAR'));
  const echo = block.getFieldValue('ECHO') === 'TRUE';
  return translate(value + Symbols.Cache + name + (echo ? Symbols.Cache : ''));
}

Generator.forBlock['variables_get'] = (block: Blockly.Block) => {
  const name = block.getField('VAR')!.getText();
  return translate(Symbols.Reference + name);
}

Generator.forBlock['variables_get_linger'] = (block: Blockly.Block) => {
  const name = block.getField('SCOPE')!.getText();
  return translate(Symbols.LingerRef + name);
}

Generator.forBlock['variables_set_linger'] = (block: Blockly.Block) => {
  const name = block.getField('VAR')!.getText();
  const scope = block.getFieldValue('SCOPE');
  return translate(name + Symbols.LingerAssign + scope);
}
