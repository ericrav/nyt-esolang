import { readFileSync } from 'fs';
import { parse, TextNode, HTMLElement } from 'node-html-parser';
import { Tokenizer } from './tokenizer';
import { Parser } from './parser';
import { Interpreter } from './interpreter';

function main() {
  const filename = process.argv[2];
  const file = readFileSync(filename);
  const html = parse(file.toString());
  const body = html.querySelector('body')!;
  const tokenizer = new Tokenizer(body);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const interpreter = new Interpreter(ast, {
    input: () => '',
    output: (str) => process.stdout.write(str),
  });
  interpreter.evaluate();
  process.stdout.write('\n');
}

main();
