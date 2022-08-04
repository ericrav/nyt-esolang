import { Article, Graf, Identifier, Quotes } from './syntax-types';
import { Token, TokenType } from './tokenizer';

export class Parser {
  tokens: Token[];
  index = 0;
  steps: [string, number][] = [];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  addStep(name: string) {
    this.steps.push([name, this.index]);
  }

  advance() {
    return this.tokens[this.index++];
  }

  peek() {
    return this.tokens[this.index];
  }

  previous() {
    return this.tokens[this.index - 1];
  }

  isAtEnd() {
    return this.index >= this.tokens.length;
  }

  match(...types: TokenType[]) {
    if (!this.isAtEnd() && types.includes(this.peek().type)) {
      this.advance();
      return true;
    }
    return false;
  }

  get(type: TokenType): Token {
    if (this.match(type)) {
      return this.previous();
    } else {
      throw new Error(`Expected token type ${type} at ${this.peek()}`)
    }
  }

  eat(type: TokenType): void {
    this.get(type);
  }

  parse(): Article {
    try {
      return this.article();
    } catch (e) {
      throw new Error(e.message + '\n' + this.steps.join('\n'));
    }
  }

  article() {
    this.addStep('article');
    const grafs: Graf[] = [];

    while (this.match(TokenType.ParagraphStart)) {
      grafs.push(this.graf());
    }

    return new Article(grafs);
  }

  graf() {
    this.addStep('graf');
    const children: any = [];
    while (!this.match(TokenType.ParagraphEnd)) {
      children.push(this.quotes());
    }

    return new Graf(children);
  }

  quotes() {
    this.addStep('quotes');
    const startingQuote = this.get(TokenType.Quote).content!;
    const verb = this.get(TokenType.Keyword).content!;
    const identifier = this.identifier();
    this.eat(TokenType.FullStop);

    let endingQuote: string | undefined;
    if (this.match(TokenType.Quote)) {
      endingQuote = this.previous().content!;
      this.eat(TokenType.FullStop);
    }

    return new Quotes(startingQuote!, verb, identifier, endingQuote);
  }

  identifier() {
    let lastName = '';
    while (this.match(TokenType.Title, TokenType.CapitalizedWord)) {
      lastName = this.previous().content!;
    }

    this.addStep('identifier');
    return new Identifier(lastName);
  }
}
