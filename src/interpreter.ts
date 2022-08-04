import { ADD, asciiDescriptors, DUPLICATE, GOTO, PRINT } from './keywords';
import { Article, Graf, Identifier, Label, Link, Quotes, Statement } from './syntax-types';

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

  empty() {
    return this.stack.length === 0;
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

  constructor(private ast: Article, private io: IO, private program: Record<string, Article> = {}) {}

  index = 0;

  labels: Record<string, number> = {};

  debug(msg: string) {
    if (process.env.DEBUG) {
      console.log("\nDebug: " + msg + " ");
    }
  }

  evaluate() {
    while (this.index < this.ast.grafs.length) {
      const graf = this.ast.grafs[this.index++];
      if (graf instanceof Graf) {
        const [child] = graf.children;
        if (child instanceof Quotes) {
          this.evaluateQuotes(child);
        } else if (child instanceof Statement) {
          this.evaluateStatement(child);
        } else if (child instanceof Link) {
          this.evaluateLink(child);
        }
      } else if (graf instanceof Label) {
        const name = graf.identifier.name;
        this.labels[name] = this.index;
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
    this.debug('PUSH ' + value + " " + stack.name);
    if (ADD.includes(quotes.verb)) {
      stack.add();
    }
  }

  evaluateLink(link: Link) {
    const article = link.href;
    const interpreter = new Interpreter(this.program[article], this.io, this.program);
    interpreter.symbolTable = this.symbolTable;
    interpreter.evaluate();
  }

  evaluateStatement(statement: Statement) {
    const { left, action, right } = statement;
    const stack = this.getStack(left);
    if (ADD.includes(action)) {
      stack.add();
    } else if (DUPLICATE.includes(action)) {
      this.debug('DUPLICATE ' + stack.name);
      const val = stack.pop();
      stack.push(val);
      stack.push(val);
    } else if (PRINT.includes(action)) {
      const val = stack.pop();
      this.debug('PRINT ' + val);
      if (stack.varType === VarType.ASCII) {
        this.io.output(String.fromCharCode(val));
      } else {
        this.io.output(String(val));
      }
    } else if (GOTO.includes(action)) {
      if (!stack.empty() && this.labels[stack.name]) {
        this.index = this.labels[stack.name];
        this.debug('GOTO ' + this.index);
      } else {
        this.debug('Stack empty')
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
