import { Parser } from '../parser';
import { Article, Graf, Identifier, Quotes } from '../syntax-types';
import { token, Token } from '../tokenizer';

test('parse', () => {
  const tokens: Token[] = [
    token.ParagraphStart(),
    token.Quote('Hello world,'),
    token.Keyword('said'),
    token.CapitalizedWord('Jane'),
    token.CapitalizedWord('Doe'),
    token.FullStop(),
    // token.Keyword('lawyer'),
    token.Quote('Latter quote.'),
    token.FullStop(),
    token.ParagraphEnd(),
  ];

  const parser = new Parser(tokens);

  expect(parser.parse()).toEqual(
    new Article([
      new Graf([
        new Quotes(
          'Hello world,',
          'said',
          new Identifier('Doe'),
          'Latter quote.'
        ),
      ]),
    ])
  );
});
