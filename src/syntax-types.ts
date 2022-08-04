export class Article {
  constructor(public grafs: Graf[]) {}
}

export class Graf {
  constructor(public children: [Quotes | Statement]) {}
}

export class Quotes {
  constructor(
    public firstQuote: string,
    public verb: string,
    public identifier: Identifier,
    public lastQuote?: string,
  ) {}
}

export class Statement {
  constructor(public left: Identifier, public action: string, public right?: Identifier) {}
}

export class Identifier {
  constructor(public name: string, public descriptor?: string) {}
}
