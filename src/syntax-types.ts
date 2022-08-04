export class Article {
  constructor(public grafs: Graf[]) {}
}

export class Graf {
  constructor(public children: [Quotes]) {}
}

export class Quotes {
  constructor(
    public firstQuote: string,
    public verb: string,
    public identifier: Identifier,
    public lastQuote?: string,
  ) {}
}

export class Identifier {
  constructor(public name: string, public descriptor?: string) {}
}
