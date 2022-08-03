import parse from 'node-html-parser';
import { token, Token, Tokenizer } from '../tokenizer';

const compare = (inputHtml: string, tokens: Token[]) => {
  test(inputHtml.trim().slice(0, 80), () => {
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
    token.CapitalizedWord("Jane"),
    token.CapitalizedWord("Doe"),
    token.FullStop(),
  ]
)

compare(`
  <p>Hello Mr. Bond James Bond Dr. Mrs.</p>
`,
  [
    token.ParagraphStart(),
    token.CapitalizedWord("Hello"),
    token.Title("Mr."),
    token.CapitalizedWord("Bond"),
    token.CapitalizedWord("James"),
    token.CapitalizedWord("Bond"),
    token.Title("Dr."),
    token.Title("Mrs."),
  ]
)

compare(`
  <p>“Hello,” said Mrs. Doe.</p>
`,
  [
    token.ParagraphStart(),
    token.Quote("Hello,"),
    token.Keyword("said"),
    token.Title("Mrs."),
    token.CapitalizedWord("Doe"),
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
    token.CapitalizedWord("Jane"),
    token.CapitalizedWord("Doe"),
    token.FullStop(),
    token.Quote("Final sentence."),
    token.FullStop(),
    token.ParagraphStart(),
    token.CapitalizedWord("Jane"),
    token.CapitalizedWord("Doe"),
    token.FullStop(),
  ]
)

compare(`
  <p>Check out <a href="other.html">this other reporting</a>.</p>
`,
  [
    token.ParagraphStart(),
    token.CapitalizedWord("Check"),
    token.ArticleLink("other.html"),
    token.FullStop(),
  ]
)
