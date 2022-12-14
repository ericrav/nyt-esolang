import { parse, TextNode, Node, HTMLElement } from 'node-html-parser';
import { keywords } from './keywords';

export class Tokenizer {
  htmlNodes: HTMLElement[];
  tokens: Token[] = [];

  constructor(html: HTMLElement) {
    this.htmlNodes = html.querySelectorAll('p,figure');
  }

  tokenize(): Array<Token> {
    this.tokens = [];
    this.htmlNodes.forEach(this.tokenizeHTMLNode.bind(this));
    return this.tokens;
  }

  tokenizeHTMLNode(node: HTMLElement) {
    let startToken, endToken;
    if (node.tagName === 'P') {
      startToken = token.ParagraphStart();
      endToken = token.ParagraphEnd()
    } else if (node.tagName === 'FIGURE') {
      startToken = token.FigureStart();
      endToken = token.FigureEnd();
      node = node.querySelector('figcaption') || node;
    }
    this.tokens.push(startToken);
    node.childNodes.forEach(child => {
      if (child instanceof TextNode) {
        this.tokenizeTextNode(child);
      } else if (isLink(child)) {
        this.tokenizeLinkElement(child);
      }
    });

    this.tokens.push(endToken);
  }

  tokenizeLinkElement(link: HTMLAnchorElement) {
    this.tokens.push(token.ArticleLink(link.getAttribute('href')!));
  }

  /*
  Plain-text scanning methods (using more typical Scanner/Tokenizer patterns : no more HTML)
  */

  text: string;
  textIndex = 0;

  tokenizeTextNode(node: TextNode) {
    this.text = node.innerText.trim();
    this.textIndex = 0;
    while (this.textIndex < this.text.length) {
      this.scanToken();
    }
  }

  advance(length = 1) {
    return this.text[this.textIndex += length];
  }

  peek() {
    return this.text[this.textIndex];
  }

  peekRegex(re: RegExp) {
    return this.text.slice(this.textIndex).match(re);
  }

  add(token: Token) {
    this.tokens.push(token);
  }

  scanToken() {
    return (
      this.scanQuote() ||
      this.scanFullStop() ||
      this.scanKeyword() ||
      this.scanTitle() ||
      this.scanCapitalizedWord() ||
      this.advance(1) // nothing found so advance one character
    );
  }

  scanFullStop() {
    const char = this.peek();
    if (char === ".") {
      this.add(token.FullStop());
      this.advance(1);
      return true;
    }

    return false;
  }

  scanQuote() {
    const match = this.peekRegex(/^???(.*?)???/)
    if (match) {
      const quoteText = match[1];
      this.add(token.Quote(quoteText));
      if (quoteText.endsWith(".")) {
        this.add(token.FullStop());
      }

      this.advance(match[0].length);
    }

    return !!match;
  }

  scanKeyword() {
    const match = this.peekRegex(new RegExp(`^(${keywords.join('|')})\\s?`))
    if (match) {
      this.add(token.Keyword(match[1]));
      this.advance(match[0].length);
    }

    return !!match;
  }

  scanTitle() {
    const match = this.peekRegex(/^((?:Dr|Mr|Mrs|Ms)\.)\s?/)
    if (match) {
      this.add(token.Title(match[1]));
      this.advance(match[0].length);
    }

    return !!match;
  }

  scanCapitalizedWord() {
    const match = this.peekRegex(/^([A-Z][a-z]+)\s?/)
    if (match) {
      this.add(token.CapitalizedWord(match[1]));
      this.advance(match[0].length);
    }

    return !!match;
  }
}

const isLink = (node: Node | HTMLAnchorElement): node is HTMLAnchorElement => node instanceof HTMLElement && node.tagName === 'A';

export enum TokenType {
  Keyword = "Keyword",
  Quote = "Quote",
  CapitalizedWord = "CapitalizedWord",
  Title = "Title",
  ArticleLink = "ArticleLink",
  FullStop = "FullStop",
  Comma = "Comma",
  FigureStart = "FigureStart",
  FigureEnd = "FigureEnd",
  ParagraphStart = "ParagraphStart",
  ParagraphEnd = "ParagraphEnd",
}

export class Token {
  type: TokenType;
  content?: string;

  constructor(type: TokenType, content?: string) {
    this.type = type;
    if (content) this.content = content;
  }

  toString() {
    return `${this.type}(${this.content || ''})`;
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
