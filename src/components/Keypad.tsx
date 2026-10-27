import type { OperationSymbol, CalcMode } from "../types";

interface KeypadProps {
  mode: CalcMode;
  onNumber: (n: string) => void;
  onOperator: (op: OperationSymbol) => void;
  onEquals: () => void;
  onClear: () => void;
  onBackspace: () => void;
  onToggleSign: () => void;
  onScientific: (fn: OperationSymbol) => void;
  onToggleMode: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface ButtonConfig {
  label: string;
  action: () => void;
  style: string;
  span?: number;
}

export function Keypad({
  mode,
  onNumber,
  onOperator,
  onEquals,
  onClear,
  onBackspace,
  onToggleSign,
  onScientific,
  onToggleMode,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: KeypadProps) {
  const scientificOps: { label: string; sym: OperationSymbol }[] = [
    { label: "sin", sym: "sin" },
    { label: "cos", sym: "cos" },
    { label: "tan", sym: "tan" },
    { label: "log", sym: "log" },
    { label: "ln", sym: "ln" },
    { label: "√", sym: "√" },
    { label: "x²", sym: "x2" },
    { label: "1/x", sym: "1/x" },
    { label: "^", sym: "^" },
    { label: "%", sym: "%" },
  ];

  const buttons: ButtonConfig[] = [
    {
      label: "C",
      action: onClear,
      style: "bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-300",
    },
    {
      label: "±",
      action: onToggleSign,
      style: "bg-slate-700/50 hover:bg-slate-700 border-slate-600",
    },
    {
      label: "%",
      action: () => mode === "BASIC" && onScientific("%"),
      style: "bg-slate-700/50 hover:bg-slate-700 border-slate-600",
    },
    {
      label: "÷",
      action: () => onOperator("/"),
      style:
        "bg-orange-500/30 hover:bg-orange-500/50 border-orange-500/30 text-orange-200",
    },
    ...(["7", "8", "9"] as const).map((n) => ({
      label: n,
      action: () => onNumber(n),
      style: "bg-slate-700/30 hover:bg-slate-700/60 border-slate-600",
    })),
    {
      label: "×",
      action: () => onOperator("*"),
      style:
        "bg-orange-500/30 hover:bg-orange-500/50 border-orange-500/30 text-orange-200",
    },
    ...(["4", "5", "6"] as const).map((n) => ({
      label: n,
      action: () => onNumber(n),
      style: "bg-slate-700/30 hover:bg-slate-700/60 border-slate-600",
    })),
    {
      label: "−",
      action: () => onOperator("-"),
      style:
        "bg-orange-500/30 hover:bg-orange-500/50 border-orange-500/30 text-orange-200",
    },
    ...(["1", "2", "3"] as const).map((n) => ({
      label: n,
      action: () => onNumber(n),
      style: "bg-slate-700/30 hover:bg-slate-700/60 border-slate-600",
    })),
    {
      label: "+",
      action: () => onOperator("+"),
      style:
        "bg-orange-500/30 hover:bg-orange-500/50 border-orange-500/30 text-orange-200",
    },
    {
      label: "0",
      action: () => onNumber("0"),
      style: "bg-slate-700/30 hover:bg-slate-700/60 border-slate-600",
      span: 2,
    },
    {
      label: ".",
      action: () => onNumber("."),
      style: "bg-slate-700/30 hover:bg-slate-700/60 border-slate-600",
    },
    {
      label: "=",
      action: onEquals,
      style:
        "bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/30",
    },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={onToggleMode}
          className="flex-1 py-2 px-3 bg-red-500 rounded-lg text-sm font-semibold transition-all hover:bg-red-600"
        >
          {mode === "BASIC" ? "Scientific" : "Basic"}
        </button>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="py-2 px-3 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm transition-all border border-slate-600"
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="py-2 px-3 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm transition-all border border-slate-600"
          title="Redo (Ctrl+Y)"
        >
          ↷
        </button>
        <button
          onClick={onBackspace}
          className="py-2 px-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm transition-all border border-slate-600"
          title="Backspace"
        >
          ⌫
        </button>
      </div>

      {mode === "SCIENTIFIC" && (
        <div className="overflow-hidden mb-3 animate-scale-in">
          <div className="grid grid-cols-5 gap-2">
            {scientificOps.map((op) => (
              <button
                key={op.sym}
                onClick={() => onScientific(op.sym)}
                className="py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 rounded-lg text-sm font-mono transition-all active:scale-95"
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            className={`${btn.style} ${btn.span === 2 ? "col-span-2" : ""} py-4 rounded-xl border font-semibold text-lg transition-all active:scale-95`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
