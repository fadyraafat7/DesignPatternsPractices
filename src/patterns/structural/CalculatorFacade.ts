
import { ExpressionBuilder } from '../creational/ExpressionBuilder';
import { OperationFactory } from '../creational/OperationFactory';
import { CalculatorEngine } from '../creational/CalculatorEngine';
import { decorateOperation } from './OperationDecorators';
import type { OperationSymbol } from '../../types';

export class CalculatorFacade {
  private builder = new ExpressionBuilder();
  private engine = CalculatorEngine.getInstance();

  calculateBinary(left: number, opSymbol: OperationSymbol, right: number): number {
    const rawOp = OperationFactory.create(opSymbol);
    if (!rawOp) throw new Error(`Unknown operation: ${opSymbol}`);

    const op = decorateOperation(rawOp);

    this.builder.reset().setLeft(left).setOperator(op).setRight(right);
    const expr = this.builder.build();

    const result = expr.operator.execute(expr.left, expr.right);
    this.engine.setCurrentValue(result);
    return result;
  }

  calculateUnary(value: number, opSymbol: OperationSymbol): number {
    const rawOp = OperationFactory.create(opSymbol);
    if (!rawOp) throw new Error(`Unknown operation: ${opSymbol}`);

    const op = decorateOperation(rawOp);
    this.builder.reset().setLeft(value).setOperator(op);
    const expr = this.builder.build();

    const result = expr.operator.execute(expr.left);
    this.engine.setCurrentValue(result);
    return result;
  }

  formatResult(value: number): string {
    const precision = this.engine.getPrecision();
    if (Number.isInteger(value) && Math.abs(value) < 1e15) {
      return value.toString();
    }
    return parseFloat(value.toFixed(precision)).toString();
  }
}