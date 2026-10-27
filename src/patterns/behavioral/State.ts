
import type { CalcContext, CalcStateName, OperationSymbol } from '../../types';

export interface CalcState {
  readonly name: CalcStateName;
  handleInput(ctx: CalcContext, value: string): boolean;
  handleOperator(ctx: CalcContext, op: OperationSymbol): boolean;
  handleEquals(ctx: CalcContext): boolean;
  handleClear(ctx: CalcContext): boolean;
}

export class IdleState implements CalcState {
  readonly name: CalcStateName = 'idle';

  handleInput(ctx: CalcContext, value: string): boolean {
    ctx.display = value === '.' ? '0.' : value;
    ctx.setState('input');
    return true;
  }

  handleOperator(ctx: CalcContext, op: OperationSymbol): boolean {
    ctx.leftOperand = 0;
    ctx.currentOperator = op;
    ctx.rightDisplay = '';
    ctx.display = `0 ${op} `;
    ctx.setState('operator');
    return true;
  }

  handleEquals(): boolean {
    return false;
  }

  handleClear(ctx: CalcContext): boolean {
    ctx.display = '0';
    return true;
  }
}

export class InputState implements CalcState {
  readonly name: CalcStateName = 'input';

  handleInput(ctx: CalcContext, value: string): boolean {
    if (value === '.' && ctx.display.includes('.')) return false;
    if (ctx.display === '0' && value !== '.') {
      ctx.display = value;
    } else {
      ctx.display += value;
    }
    return true;
  }

  handleOperator(ctx: CalcContext, op: OperationSymbol): boolean {
    ctx.leftOperand = parseFloat(ctx.display);
    ctx.currentOperator = op;
    ctx.display = `${ctx.leftOperand} ${op} `;
    ctx.rightDisplay = '';
    ctx.setState('operator');
    return true;
  }

  handleEquals(): boolean {
    return false;
  }

  handleClear(ctx: CalcContext): boolean {
    ctx.display = '0';
    ctx.leftOperand = null;
    ctx.currentOperator = null;
    ctx.rightDisplay = '';
    ctx.setState('idle');
    return true;
  }
}

export class OperatorState implements CalcState {
  readonly name: CalcStateName = 'operator';

  handleInput(ctx: CalcContext, value: string): boolean {
    if (value === '.' && ctx.rightDisplay.includes('.')) return false;
    if (ctx.rightDisplay === '' && value === '.') {
      ctx.rightDisplay = '0.';
    } else if (ctx.rightDisplay === '0' && value !== '.') {
      ctx.rightDisplay = value;
    } else {
      ctx.rightDisplay += value;
    }
    ctx.display = `${ctx.leftOperand} ${ctx.currentOperator} ${ctx.rightDisplay}`;
    return true;
  }

  handleOperator(ctx: CalcContext, op: OperationSymbol): boolean {
    if (ctx.rightDisplay === '') {
      ctx.currentOperator = op;
      ctx.display = `${ctx.leftOperand} ${op} `;
      return true;
    }
    return false;
  }

  handleEquals(ctx: CalcContext): boolean {
    if (ctx.rightDisplay === '') return false;
    ctx.setState('result');
    return true;
  }

  handleClear(ctx: CalcContext): boolean {
    ctx.display = '0';
    ctx.leftOperand = null;
    ctx.currentOperator = null;
    ctx.rightDisplay = '';
    ctx.setState('idle');
    return true;
  }
}

export class ResultState implements CalcState {
  readonly name: CalcStateName = 'result';

  handleInput(ctx: CalcContext, value: string): boolean {
    ctx.display = value === '.' ? '0.' : value;
    ctx.leftOperand = null;
    ctx.currentOperator = null;
    ctx.rightDisplay = '';
    ctx.setState('input');
    return true;
  }

  handleOperator(ctx: CalcContext, op: OperationSymbol): boolean {
    ctx.leftOperand = parseFloat(ctx.display);
    ctx.currentOperator = op;
    ctx.display = `${ctx.leftOperand} ${op} `;
    ctx.rightDisplay = '';
    ctx.setState('operator');
    return true;
  }

  handleEquals(): boolean {
    return false;
  }

  handleClear(ctx: CalcContext): boolean {
    ctx.display = '0';
    ctx.leftOperand = null;
    ctx.currentOperator = null;
    ctx.rightDisplay = '';
    ctx.setState('idle');
    return true;
  }
}

export class ErrorState implements CalcState {
  readonly name: CalcStateName = 'error';

  handleInput(): boolean {
    return false;
  }
  handleOperator(): boolean {
    return false;
  }
  handleEquals(): boolean {
    return false;
  }
  handleClear(ctx: CalcContext): boolean {
    ctx.display = '0';
    ctx.leftOperand = null;
    ctx.currentOperator = null;
    ctx.rightDisplay = '';
    ctx.error = null;
    ctx.setState('idle');
    return true;
  }
}

export class StateMachine {
  private states: Record<CalcStateName, CalcState> = {
    idle: new IdleState(),
    input: new InputState(),
    operator: new OperatorState(),
    result: new ResultState(),
    error: new ErrorState(),
  };
  private current: CalcState = this.states.idle;

  setState(name: CalcStateName): void {
    this.current = this.states[name];
    console.log(`[State] Transition → ${name}`);
  }

  getStateName(): CalcStateName {
    return this.current.name;
  }

  getCurrent(): CalcState {
    return this.current;
  }
}
