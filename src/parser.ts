import { binaryActions, descriptors } from './keywords';
import { Article, Graf, Identifier, Label, Link, Quotes, Statement } from './syntax-types';
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

  matchKeyword(keywords: string[]) {
    if (
      !this.isAtEnd() &&
      this.peek().type === TokenType.Keyword &&
      keywords.includes(this.peek().content!)
    ) {
      this.advance();
      return true;
    }
    return false;
  }

  get(type: TokenType): Token {
    if (this.match(type)) {
      return this.previous();
    } else {
      throw new Error(`Expected token type ${type} at ${this.peek()}`);
    }
  }

  eat(type: TokenType): void {
    this.get(type);
  }

  parse(): Article {
    try {
      return this.article();
    } catch (e) {
      e.message += '\n' + this.steps.join('\n');
      throw e;
    }
  }

  article() {
    this.addStep('article');
    const articleChildren: (Graf | Label)[] = [];

    while (this.match(TokenType.ParagraphStart, TokenType.FigureStart)) {
      const type = this.previous().type;
      if (type === TokenType.ParagraphStart) {
        const graf = this.graf()
        if (graf.children.length > 0) {
          articleChildren.push(graf);
        }
      } else if (type === TokenType.FigureStart) {
        const label = this.figure();
        articleChildren.push(label);
      }
    }

    return new Article(articleChildren);
  }

  graf() {
    this.addStep('graf');
    const children: any = [];
    while (!this.match(TokenType.ParagraphEnd)) {
      if (this.peek().type === TokenType.Quote) {
        children.push(this.quotes());
      } else {
        try {
          children.push(this.grafSentence());
        } catch {
          if (this.peek().type === TokenType.FullStop) {
            this.advance();
          } else {
            while (
              !this.isAtEnd() &&
              ![TokenType.FullStop, TokenType.ParagraphEnd].includes(
                this.peek().type
              )
            ) {
              this.advance();
            }
          }
        }
      }
    }

    return new Graf(children);
  }

  figure() {
    this.addStep('figure');
    const identifier = this.identifier();
    while (!this.match(TokenType.FigureEnd)) {
      this.advance();
    }

    return new Label(identifier);
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


  grafSentence() {
    const tokens: Token[] = [];
    const current = this.index;
    while (!this.match(TokenType.FullStop)) {
      tokens.push(this.advance());
    }

    this.index = current;
    if (tokens.some(token => token.type === TokenType.ArticleLink)) {
      return this.link()
    } else {
      return this.statement();
    }
  }

  statement() {
    this.addStep('statement');
    const identifier = this.identifier();
    const action = this.get(TokenType.Keyword).content!;
    let right;
    if (binaryActions.includes(action)){
      right = this.identifier();
    }
    this.eat(TokenType.FullStop);

    return new Statement(identifier, action, right);
  }

  link() {
    this.addStep('link');
    while (!this.match(TokenType.ArticleLink)) {
      this.advance();
    }
    const link = this.previous().content!;
    this.eat(TokenType.FullStop);

    return new Link(link);
  }

  identifier() {
    this.addStep('identifier');
    let lastName = '';
    while (this.match(TokenType.Title, TokenType.CapitalizedWord)) {
      lastName = this.previous().content!;
    }

    let descriptor: string | undefined;
    if (this.matchKeyword(descriptors)) {
      descriptor = this.previous().content!;
    }

    return new Identifier(lastName, descriptor);
  }
}
