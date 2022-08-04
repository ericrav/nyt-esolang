import { Article, Graf, Quotes } from "./syntax-types";

class Stack {
  stack: number[] = [];
  constructor(public name: string, public varType: VarType) {}

  push(value: number) {
    this.stack.push(value);
  }

  pop(): number {
    return this.stack.pop() || 0;
  }

  add() {
    this.push(
      this.pop() + this.pop()
    )
  }
}

enum VarType {
  Numerical,
  ASCII,
}

class SymbolTable {
  table = new Map<string, Stack>();

  define(name: string, varType = VarType.Numerical) {
    const stack = this.table.get(name);
    if (stack) {
      stack.varType = varType;
      return stack;
    } else {
      const stack = new Stack(name, varType);
      this.table.set(name, stack);
      return stack;
    }
  }

  get(name: string): Stack {
    const stack = this.table.get(name);
    if (stack) return stack;
    throw new Error(`Editor: who is ${name}?`);
  }
}

export class Interpreter {
  public symbolTable = new SymbolTable();

  constructor(private ast: Article) {}

  evaluate() {
    this.ast.grafs.forEach(graf => {
      const [child] = graf.children;
      if (child instanceof Quotes) {
        this.evaluateQuotes(child);
      }
    })
  }

  evaluateQuotes(quotes: Quotes) {
    const { identifier } = quotes;
    const stack = this.symbolTable.define(identifier.name);
    const value = calculateQuoteValue(quotes);
    stack.push(value);
    if (quotes.verb === "added") {
      stack.add();
    }
  }
}

function calculateQuoteValue(quotes: Quotes): number {
  const evenPart = quotes.firstQuote;

  const calculate = (quote: string): number => {
    const sentences = quote.split(". ");
    return sentences.reduce((num, sentence) => num + Math.pow(2, sentence.split(" ").length), 0);
  }

  const oddPart = quotes.lastQuote;
  return calculate(evenPart) + (oddPart ? calculate(oddPart) + 1 : 0);
}
