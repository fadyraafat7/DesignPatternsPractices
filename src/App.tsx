import { Display } from "./components/Display";
import { HistoryPanel } from "./components/HistoryPanel";
import { Keypad } from "./components/Keypad";
import { useCalculator } from "./hooks/useCalculator";

export default function App() {
  const calc = useCalculator();

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <div className="relative max-w-7xl mx-auto">
        <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-down">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold ">
              Design Pattern Calculator
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              10 patterns implemented in a calculator app
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-slate-800/60 backdrop-blur rounded-lg border border-slate-700 text-sm">
              <span className="text-xs text-slate-400">State:</span>
              <span className="ml-2 font-mono text-cyan-400">
                {calc.stateName}
              </span>
            </div>
            <div className="px-4 py-2 bg-slate-800/60 backdrop-blur rounded-lg border border-slate-700 text-sm">
              <span className="text-xs text-slate-400">Mode:</span>
              <span className="ml-2 font-mono text-pink-400">{calc.mode}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 animate-fade-in-left">
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 shadow-2xl">
              <Display
                display={calc.display}
                error={calc.error}
                stateName={calc.stateName}
                mode={calc.mode}
                activePattern={calc.activePattern}
              />
              <Keypad
                mode={calc.mode}
                onNumber={calc.handleNumber}
                onOperator={calc.handleOperator}
                onEquals={calc.handleEquals}
                onClear={calc.handleClear}
                onBackspace={calc.handleBackspace}
                onToggleSign={calc.handleToggleSign}
                onScientific={calc.handleScientific}
                onToggleMode={calc.toggleMode}
                onUndo={calc.handleUndo}
                onRedo={calc.handleRedo}
                canUndo={calc.canUndo}
                canRedo={calc.canRedo}
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 animate-fade-in-right">
            <HistoryPanel history={calc.history} onClear={calc.clearHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}