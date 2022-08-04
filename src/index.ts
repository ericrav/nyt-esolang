import { readdirSync, readFileSync } from 'fs';
import { parse, TextNode, HTMLElement } from 'node-html-parser';
import { Tokenizer } from './tokenizer';
import { Parser } from './parser';
import { Interpreter } from './interpreter';
import path from 'path';

function main() {
  const folder = process.argv[2];
  const files = readdirSync(folder);
  const program = files.reduce((dict, filename) => {
    const file = readFileSync(path.join(folder, filename));
    const html = parse(file.toString());
    const body = html.querySelector('article')!;
    const tokenizer = new Tokenizer(body);
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    dict[filename] = ast;
    return dict;
  }, {});
  const interpreter = new Interpreter(program['main.html'], {
    input: () => '',
    output: (str) => process.stdout.write(str),
  }, program);
  interpreter.evaluate();
  process.stdout.write('\n');
}

main();
