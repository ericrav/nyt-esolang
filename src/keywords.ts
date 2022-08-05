export const quoteWords = ["said", "added"];

export const ADD = ["added"];
export const DUPLICATE = ["confirmed", "can confirm"];
export const PRINT = ["announced", "signed"];
export const GOTO = ["continue", "continues"];
// export const EQUALS = ["equals"];
// export const GOTO_IF_NOT_EMPTY = ["goto"];
// export const GOTO_IF_ZERO = ["goto"];
// export const GOTO_IF_NOT_ZERO = ["goto"];
export const unaryActions = [...ADD, ...DUPLICATE, ...PRINT, ...GOTO];

export const MOVE = ["gave", "told"];
export const binaryActions = [...MOVE];

export const asciiDescriptors = ["lawyer", "actor", "actress"]
export const numericDescriptors = ["scientist"]
export const descriptors = [...asciiDescriptors, ...numericDescriptors];


export const keywords = [
  ...quoteWords,
  ...unaryActions,
  ...binaryActions,
  ...descriptors,
]
