export const quoteWords = ["said", "added"];

export const ADD = ["added"];
export const DUPLICATE = ["confirmed", "can confirm"];
export const PRINT = ["announced", "signed"];
export const unaryActions = [...ADD, ...DUPLICATE, ...PRINT];

export const binaryActions = ["gave", "told"];

export const asciiDescriptors = ["lawyer", "actor", "actress"]
export const numericDescriptors = ["scientist"]
export const descriptors = [...asciiDescriptors, ...numericDescriptors];


export const keywords = [
  ...quoteWords,
  ...unaryActions,
  ...binaryActions,
  ...descriptors,
]
