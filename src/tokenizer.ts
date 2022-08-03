import { parse, TextNode, HTMLElement } from 'node-html-parser';

export class Tokenizer {
  html: HTMLElement;

  constructor(html: HTMLElement) {
    this.html = html;
  }

  tokenize(): Array<Token> {
    return [
      new Token(TokenType.Quote, 'Hello world,'),
      new Token(TokenType.Keyword, 'said'),
      new Token(TokenType.Identifier, 'Jane Doe'),
      new Token(TokenType.ArticleLink, 'foobar.html'),
      new Token(TokenType.FullStop, '.'),
      new Token(TokenType.ParagraphBreak, '\n'),
    ];
  }
}

export enum TokenType {
  Keyword,
  Quote,
  Identifier,
  FullStop,
  ArticleLink,
  ParagraphBreak,
}

export class Token {
  type: TokenType;
  lexeme?: string;

  constructor(type: TokenType, lexeme?: string) {
    this.type = type;
    this.lexeme = lexeme;
  }
}


type Args = ConstructorParameters<typeof Token> extends [type: TokenType, ...args: infer P] ? P : never;
/**
 * Token instance creation helper
 * Usage:
 * token.FullStop() or token.Identifier("Jane Doe")
 */
export const token =
  Object.keys(TokenType).reduce((obj, tokenType) => {
    obj[tokenType] = (...args: Args) => new Token(TokenType[tokenType], ...args);
    return obj;
  }, {} as Record<keyof typeof TokenType, (...args: Args) => Token>);
