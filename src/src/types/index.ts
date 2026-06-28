
export type OperationSymbol =
  | '+' | '-' | '*' | '/' | '^' | '%'
  | '√' | 'sin' | 'cos' | 'tan' | 'log' | 'ln' | 'x2' | '1/x';

export interface Operation {
  symbol: OperationSymbol;
  execute(a: number, b?: number): number;
  isUnary: boolean;
}

export interface CalcContext {
  display: string;
  leftOperand: number | null;
  currentOperator: OperationSymbol | null;
  rightDisplay: string;
  error: string | null;
  setState: (name: CalcStateName) => void;
}

export type CalcStateName = 'idle' | 'input' | 'operator' | 'result' | 'error';

export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
  error: boolean;
}

export type CalcMode = 'BASIC' | 'SCIENTIFIC';

