
import type { Operation } from '../../types';

export abstract class OperationDecorator implements Operation {
  public readonly wrapped: Operation;
  constructor(wrapped: Operation) {
    this.wrapped = wrapped;
  }
  get symbol() {
    return this.wrapped.symbol;
  }
  get isUnary() {
    return this.wrapped.isUnary;
  }

  abstract execute(a: number, b?: number): number;
}

export class ValidationDecorator extends OperationDecorator {
  execute(a: number, b?: number): number {
    const sym = this.wrapped.symbol;

    if (sym === '/' && b === 0) throw new Error('Cannot divide by zero');
    if (sym === '1/x' && a === 0) throw new Error('Cannot divide by zero');
    if (sym === '√' && a < 0) throw new Error('Cannot take square root of negative');
    if (sym === 'log' && a <= 0) throw new Error('Logarithm undefined for non-positive');
    if (sym === 'ln' && a <= 0) throw new Error('Ln undefined for non-positive');
    if (!isFinite(a) || (b !== undefined && !isFinite(b))) {
      throw new Error('Invalid number (Infinity/NaN)');
    }

    console.log(`[Decorator:Validation] ✓ ${a} ${sym} ${b ?? ''}`);
    return this.wrapped.execute(a, b);
  }
}

export class LoggingDecorator extends OperationDecorator {
  execute(a: number, b?: number): number {
    const start = performance.now();
    const result = this.wrapped.execute(a, b);
    const duration = (performance.now() - start).toFixed(3);
    console.log(
      `[Decorator:Logging] ${a} ${this.wrapped.symbol} ${b ?? ''} = ${result} (${duration}ms)`
    );
    return result;
  }
}

export function decorateOperation(op: Operation): Operation {
  return new LoggingDecorator(new ValidationDecorator(op));
}