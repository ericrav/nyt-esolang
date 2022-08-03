import { command, Command } from "./commands";
import { Token, TokenType } from "./tokenizer";

export class Parser {
  tokens: Token[];
  tokenIndex = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  advance() {
    return this.tokens[this.tokenIndex++];
  }

  peek() {
    return this.tokens[this.tokenIndex];
  }

  eat(type: TokenType) {
    if (this.peek().type === type) {
      this.advance();
    } else {
      throw new Error(`Expected token type ${type}`);
    }
  }

  parse(): Command[] {
    this.eat(TokenType.ParagraphStart);

    const quote = this.advance();
    const saidKeyword = this.advance();
    const identifier = this.advance();
    this.eat(TokenType.FullStop);

    return [
      command.Push({
        identifier,
        quotes: [quote],
        keyword: saidKeyword,
      })
    ];
  }
}
