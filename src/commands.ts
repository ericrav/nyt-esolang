export enum CommandType {
  Push = "Push",
}

export class Command {
  type: CommandType;
  data: Record<string, any>;

  constructor(type: CommandType, data: Record<string, any>) {
    this.type = type;
    if (data) this.data = data;
  }
}


type Args = ConstructorParameters<typeof Command> extends [type: CommandType, ...args: infer P] ? P : never;
/**
 * Command instance creation helper
 * Usage:
 * token.FullStop() or token.Identifier("Jane Doe")
 */
export const command =
  Object.keys(CommandType).reduce((obj, commandType) => {
    obj[commandType] = (...args: Args) => new Command(CommandType[commandType], ...args);
    return obj;
  }, {} as Record<keyof typeof CommandType, (...args: Args) => Command>);

