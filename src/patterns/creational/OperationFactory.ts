import type { Operation, OperationSymbol } from "../../types";

class BinaryOperation implements Operation {
  public readonly isUnary = false;
  public readonly symbol: OperationSymbol;
  private readonly fn: (a: number, b: number) => number;

  constructor(symbol: OperationSymbol, fn: (a: number, b: number) => number) {
    this.symbol = symbol;
    this.fn = fn;
  }

  execute(a: number, b: number = 0): number {
    return this.fn(a, b);
  }
}

class UnaryOperation implements Operation {
  public readonly isUnary = true;
  public readonly symbol: OperationSymbol;
  private readonly fn: (a: number) => number;

  constructor(symbol: OperationSymbol, fn: (a: number) => number) {
    this.symbol = symbol;
    this.fn = fn;
  }

  execute(a: number): number {
    return this.fn(a);
  }
}

export class OperationFactory {
  private static readonly registry: Record<string, () => Operation> = {
    "+": () => new BinaryOperation("+", (a, b) => a + b),
    "-": () => new BinaryOperation("-", (a, b) => a - b),
    "*": () => new BinaryOperation("*", (a, b) => a * b),
    "/": () => new BinaryOperation("/", (a, b) => a / b),
    "^": () => new BinaryOperation("^", (a, b) => Math.pow(a, b)),
    "%": () => new BinaryOperation("%", (a, b) => a % b),
    "√": () => new UnaryOperation("√", (a) => Math.sqrt(a)),
    sin: () => new UnaryOperation("sin", (a) => Math.sin((a * Math.PI) / 180)),
    cos: () => new UnaryOperation("cos", (a) => Math.cos((a * Math.PI) / 180)),
    tan: () => new UnaryOperation("tan", (a) => Math.tan((a * Math.PI) / 180)),
    log: () => new UnaryOperation("log", (a) => Math.log10(a)),
    ln: () => new UnaryOperation("ln", (a) => Math.log(a)),
    x2: () => new UnaryOperation("x2", (a) => a * a),
    "1/x": () => new UnaryOperation("1/x", (a) => 1 / a),
  };

  static create(type: OperationSymbol): Operation | null {
    const factory = OperationFactory.registry[type];
    if (!factory) {
      console.warn(`[Factory] Unknown operation: ${type}`);
      return null;
    }
    console.log(`[Factory] Creating operation: ${type}`);
    return factory();
  }

  static getSupportedOperations(): OperationSymbol[] {
    return Object.keys(OperationFactory.registry) as OperationSymbol[];
  }
}
