import parse from 'node-html-parser';
import { token, Token, Tokenizer } from '../tokenizer';

const compare = (inputHtml: string, tokens: Token[]) => {
  test('tokenize', () => {
    const html = parse(inputHtml);
    expect(new Tokenizer(html).tokenize()).toEqual(tokens);
  });
};

compare(`
  <p>“Hello,” said Jane Doe.</p>
`,
  [
    token.ParagraphStart(),
    token.Quote("Hello,"),
    token.Keyword("said"),
    token.Identifier("Jane Doe"),
    token.FullStop(),
  ]
)

compare(`
  <p>“Hello world. Another sentence,” said Jane Doe. “Final sentence.”</p>
  <p>Jane Doe went.</p>
`,
  [
    token.ParagraphStart(),
    token.Quote("Hello world. Another sentence,"),
    token.Keyword("said"),
    token.Identifier("Jane Doe"),
    token.FullStop(),
    token.Quote("Final sentence."),
    token.FullStop(),
    token.ParagraphStart(),
    token.Identifier("Jane Doe"),
    token.FullStop(),
  ]
)

compare(`
  <p>Check out <a href="other.html">this other reporting</a>.</p>
`,
  [
    token.ParagraphStart(),
    token.Identifier("Check"),
    token.ArticleLink("other.html"),
    token.FullStop(),
  ]
)
