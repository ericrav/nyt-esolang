import { readFileSync } from 'fs';
import { parse, TextNode, HTMLElement } from 'node-html-parser';
import { Tokenizer } from './tokenizer';
import { Parser } from './parser';

function main(filename: string) {
  const file = readFileSync(filename);
  const html = parse(file.toString());
  const body = html.querySelector('body');
  const paragraphs = body?.querySelectorAll('p');
  paragraphs?.forEach(p => {
    p.childNodes.forEach(node => {
      if (node instanceof TextNode) {
        console.log(node.innerText.trim());
      } else if (node instanceof HTMLElement && node.tagName === 'A') {
        console.log(node.getAttribute('href'));
      }
    })
  })

  const tokenizer = new Tokenizer(body);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens);
  const abstractSyntaxTree = parser.parse();
}

main('examples/hello_world/main.html');
