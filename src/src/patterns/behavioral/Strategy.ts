
import type { OperationSymbol, CalcMode } from '../../types';

export interface CalculationStrategy {
  mode: CalcMode;
  getOperations(): OperationSymbol[];
  getScientificOps(): OperationSymbol[];
}

export class BasicStrategy implements CalculationStrategy {
  mode: CalcMode = 'BASIC';

  getOperations(): OperationSymbol[] {
    return ['+', '-', '*', '/'];
  }

  getScientificOps(): OperationSymbol[] {
    return [];
  }
}

export class ScientificStrategy implements CalculationStrategy {
  mode: CalcMode = 'SCIENTIFIC';

  getOperations(): OperationSymbol[] {
    return ['+', '-', '*', '/', '^', '%'];
  }

  getScientificOps(): OperationSymbol[] {
    return ['√', 'x2', '1/x', 'sin', 'cos', 'tan', 'log', 'ln'];
  }
}

export class StrategyContext {
  private strategy: CalculationStrategy;

  constructor(strategy: CalculationStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: CalculationStrategy): void {
    this.strategy = strategy;
    console.log(`[Strategy] Switched to: ${strategy.mode}`);
  }

  getStrategy(): CalculationStrategy {
    return this.strategy;
  }

  getMode(): CalcMode {
    return this.strategy.mode;
  }
}