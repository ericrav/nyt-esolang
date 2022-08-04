import { Interpreter } from "../interpreter"
import { Article, Graf, Identifier, Quotes } from "../syntax-types";

test('pushing values', () => {
  const article = new Article([
    new Graf([new Quotes("One two three. One,", "said", new Identifier("A"))]),
    new Graf([new Quotes("One two. One two three four,", "said", new Identifier("A"), "One two.")]),
    new Graf([new Quotes("One two,", "said", new Identifier("B"), "One.")]),
    new Graf([new Quotes("One,", "added", new Identifier("B"), "One.")]),
    new Graf([new Quotes("One. One. One,", "said", new Identifier("C"), "One two.")]),
    new Graf([new Quotes("One. One. One,", "said", new Identifier("C"), "One two.")]),
    new Graf([new Quotes("One,", "said", new Identifier("C"), "One two. One two three")]),
    new Graf([new Quotes("One,", "added", new Identifier("C"))]),
    new Graf([new Quotes("One two,", "said", new Identifier("C"))]),
  ]);
  const interpreter = new Interpreter(article, { input: () => '', output: console.log });
  interpreter.evaluate();

  expect(interpreter.symbolTable.get('A').stack).toEqual([
    2**3 + 2, // 10
    2**2 + 2**4 + (2**2 + 1) // 25
  ]);

  expect(interpreter.symbolTable.get('B').stack).toEqual([
    12 // 7 ADD 5
  ]);

  expect(interpreter.symbolTable.get('C').stack).toEqual([
    11,
    11,
    17,
    4,
  ]);
});
