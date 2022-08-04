import { ADD, asciiDescriptors, DUPLICATE, PRINT } from './keywords';
import { Article, Graf, Identifier, Quotes, Statement } from './syntax-types';

class Stack {
  stack: number[] = [];
  constructor(public name: string, public varType = VarType.Numerical) {}

  push(value: number) {
    this.stack.push(value);
  }

  pop(): number {
    return this.stack.pop() || 0;
  }

  add() {
    this.push(this.pop() + this.pop());
  }
}

enum VarType {
  Numerical = 1,
  ASCII,
}

class SymbolTable {
  table = new Map<string, Stack>();

  define(name: string, varType?: VarType) {
    const stack = this.table.get(name);
    if (!stack) {
      const stack = new Stack(name, varType);
      this.table.set(name, stack);
      return stack;
    }

    if (varType) {
      stack.varType = varType;
    }

    return stack;
  }

  get(name: string): Stack {
    const stack = this.table.get(name);
    if (stack) return stack;
    throw new Error(`Editor: who is ${name}?`);
  }
}

interface IO {
  input: () => string;
  output: (chars: string) => void;
}

export class Interpreter {
  public symbolTable = new SymbolTable();

  constructor(private ast: Article, private io: IO) {}

  index = 0;

  evaluate() {
    while (this.index < this.ast.grafs.length) {
      const graf = this.ast.grafs[this.index++];
      const [child] = graf.children;
      if (child instanceof Quotes) {
        this.evaluateQuotes(child);
      } else if (child instanceof Statement) {
        this.evaluateStatement(child);
      }
    }
  }

  getStack(identifier: Identifier) {
    return this.symbolTable.get(identifier.name);
  }

  evaluateQuotes(quotes: Quotes) {
    const { identifier } = quotes;
    const stack = this.symbolTable.define(
      identifier.name,
      asciiDescriptors.includes(identifier.descriptor!)
        ? VarType.ASCII
        : undefined
    );
    const value = calculateQuoteValue(quotes);
    stack.push(value);
    if (ADD.includes(quotes.verb)) {
      stack.add();
    }
  }

  evaluateStatement(statement: Statement) {
    const { left, action, right } = statement;
    const stack = this.getStack(left);
    if (ADD.includes(action)) {
      stack.add();
    } else if (DUPLICATE.includes(action)) {
      const val = stack.pop();
      stack.push(val);
      stack.push(val);
    } else if (PRINT.includes(action)) {
      const val = stack.pop();
      if (stack.varType === VarType.ASCII) {
        this.io.output(String.fromCharCode(val));
      } else {
        this.io.output(String(val));
      }
    }
  }
}

function calculateQuoteValue(quotes: Quotes): number {
  const evenPart = quotes.firstQuote;

  const calculate = (quote: string): number => {
    const sentences = quote.split('. ');
    return sentences.reduce(
      (num, sentence) => num + Math.pow(2, sentence.split(' ').length),
      0
    );
  };

  const oddPart = quotes.lastQuote;
  return calculate(evenPart) + (oddPart ? calculate(oddPart) + 1 : 0);
}
