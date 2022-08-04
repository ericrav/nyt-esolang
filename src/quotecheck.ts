import parse from 'node-html-parser';
import rl from 'readline';
import { calculateQuoteValue } from './interpreter';
import { Parser } from './parser';
import { Graf, Quotes } from './syntax-types';
import { Tokenizer } from './tokenizer';

const readline = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const quotecheck = () => {
  readline.question('\n----------\nEnter quote: ', (quote) => {
    console.log(quote);

    const html = parse(`<p>${quote}</p>`);
    const tokens = new Tokenizer(html).tokenize();
    const ast = new Parser(tokens).parse();

    const quotes = ((ast.grafs[0] as Graf).children[0] as Quotes);

    const value = calculateQuoteValue(quotes);
    console.log(`\nValue:\n${value} : '${String.fromCharCode(value)}'\n---`);
    console.log(quotes);

    quotecheck();
  });
};

quotecheck();
