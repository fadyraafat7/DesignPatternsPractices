import type { HistoryEntry } from "../types";

interface HistoryPanelProps {
  history: HistoryEntry[];
  onClear: () => void;
}

export function HistoryPanel({ history, onClear }: HistoryPanelProps) {
  return (
    <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">History</h2>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        {history.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No calculations yet Start typing!
          </div>
        ) : (
          history.slice(0, 15).map((h) => (
            <div
              key={h.id}
              className={`p-3 rounded-lg border animate-fade-in-left ${
                h.error
                  ? "bg-red-500/10 border-red-500/30"
                  : "bg-slate-900/40 border-slate-700/50"
              }`}
            >
                <div className="font-mono text-sm text-slate-300 truncate">
                  {h.expression}
                </div>
                
              <div
                className={`font-mono text-lg font-bold mt-1 ${
                  h.error ? "text-red-400" : "text-emerald-400"
                }`}
              >
                = {h.result}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
