import { command } from "../commands";
import { Parser } from "../parser";
import { token, Token } from "../tokenizer";



test("parse", () => {
  const tokens: Token[] = [
    token.ParagraphStart(),
    token.Quote("Hello world,"),
    token.Keyword("said"),
    token.Identifier("Jane Doe"),
    token.FullStop(),
  ];

  const parser = new Parser(tokens);

  const commands = [
    command.Push({
      identifier: token.Identifier("Jane Doe"),
      quotes: [token.Quote("Hello world,")],
      keyword: token.Keyword("said"),
    })
  ]

  expect(parser.parse()).toEqual(commands);
})

const Push = {
  identifier: token.Identifier("Jane Doe"),
  quotes: [token.Quote("Hello world,")],
};
