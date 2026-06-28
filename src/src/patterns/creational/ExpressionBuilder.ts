
import type { Operation } from '../../types';

export interface BuiltExpression {
  left: number;
  operator: Operation;
  right?: number;
}

export class ExpressionBuilder {
  private left: number | null = null;
  private operator: Operation | null = null;
  private right: number | null = null;

  reset(): ExpressionBuilder {
    this.left = null;
    this.operator = null;
    this.right = null;
    return this;
  }

  setLeft(value: number): ExpressionBuilder {
    this.left = value;
    return this;
  }

  setOperator(op: Operation): ExpressionBuilder {
    this.operator = op;
    return this;
  }

  setRight(value: number): ExpressionBuilder {
    this.right = value;
    return this;
  }

  build(): BuiltExpression {
    if (this.left === null) {
      throw new Error('Builder: Missing left operand');
    }
    if (!this.operator) {
      throw new Error('Builder: Missing operator');
    }
    if (!this.operator.isUnary && this.right === null) {
      throw new Error('Builder: Missing right operand for binary operation');
    }
    if (this.operator.isUnary && this.right !== null) {
      throw new Error('Builder: Unary operation should not have right operand');
    }

    const result: BuiltExpression = {
      left: this.left,
      operator: this.operator,
    };
    if (!this.operator.isUnary) {
      result.right = this.right as number;
    }
    console.log('[Builder] Expression built:', {
      left: result.left,
      op: result.operator.symbol,
      right: result.right,
    });
    return result;
  }
}