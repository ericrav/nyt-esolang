import { Parser } from '../parser';
import { Article, Graf, Identifier, Label, Quotes, Statement } from '../syntax-types';
import { token } from '../tokenizer';

test('quote', () => {
  const parser = new Parser([
    token.ParagraphStart(),
    token.Quote('Hello world,'),
    token.Keyword('said'),
    token.CapitalizedWord('Jane'),
    token.CapitalizedWord('Doe'),
    token.Keyword('lawyer'),
    token.FullStop(),
    token.Quote('Latter quote.'),
    token.FullStop(),
    token.ParagraphEnd(),
  ]);

  expect(parser.parse()).toEqual(
    new Article([
      new Graf([
        new Quotes(
          'Hello world,',
          'said',
          new Identifier('Doe', 'lawyer'),
          'Latter quote.'
        ),
      ]),
    ])
  );
});

test('multi-graf', () => {
  const parser = new Parser([
    token.ParagraphStart(),
    token.Quote('Some quote,'),
    token.Keyword('added'),
    token.Title('Mr.'),
    token.CapitalizedWord('Smith'),
    token.FullStop(),
    token.ParagraphEnd(),
    token.ParagraphStart(),
    token.CapitalizedWord('But'),
    token.Title('Mr.'),
    token.CapitalizedWord('Smith'),
    token.Keyword('confirmed'),
    token.FullStop(),
    token.ParagraphEnd(),
  ]);

  expect(parser.parse()).toEqual(
    new Article([
      new Graf([
        new Quotes(
          'Some quote,',
          'added',
          new Identifier('Smith'),
        ),
      ]),
      new Graf([
        new Statement(new Identifier('Smith'), 'confirmed')
      ])
    ])
  );
});

test('figure', () => {
  const parser = new Parser([
    token.ParagraphStart(),
    token.Quote('Some quote,'),
    token.Keyword('added'),
    token.Title('Mr.'),
    token.CapitalizedWord('Bond'),
    token.FullStop(),
    token.ParagraphEnd(),
    token.FigureStart(),
    token.CapitalizedWord('James'),
    token.CapitalizedWord('Bond'),
    token.FullStop(),
    token.FigureEnd(),
  ]);

  expect(parser.parse()).toEqual(
    new Article([
      new Graf([
        new Quotes(
          'Some quote,',
          'added',
          new Identifier('Bond'),
        ),
      ]),
      new Label(new Identifier('Bond')),
    ])
  );
});

test('ignore junk grafs', () => {
  const parser = new Parser([
    token.ParagraphStart(),
    token.Quote('Some quote,'),
    token.Keyword('said'),
    token.Title('Mr.'),
    token.CapitalizedWord('Smith'),
    token.FullStop(),
    token.ParagraphEnd(),
    token.ParagraphStart(),
    token.CapitalizedWord('However'),
    token.FullStop(),
    token.ParagraphEnd(),
    token.ParagraphStart(),
    token.ParagraphEnd(),
  ]);

  expect(parser.parse()).toEqual(
    new Article([
      new Graf([
        new Quotes(
          'Some quote,',
          'said',
          new Identifier('Smith'),
        ),
      ]),
    ])
  );
});

