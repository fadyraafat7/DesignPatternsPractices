interface DisplayProps {
  display: string;
  error: string | null;
  stateName: string;
  mode: string;
  activePattern: string | null;
  lastAction?: string;
}

export function Display({
  display,
  error,
  stateName,
  mode,
  activePattern,
  lastAction,
}: DisplayProps) {
  return (
    <div className="bg-slate-900/60 rounded-2xl p-5 mb-4 border border-slate-700/50 min-h-35 flex flex-col justify-end relative overflow-hidden">
      <div className="absolute top-3 left-4 flex gap-2 text-[10px] uppercase tracking-wider">
        <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/30 font-mono">
          {stateName}
        </span>
        <span className="px-2 py-0.5 bg-pink-500/10 text-pink-400 rounded border border-pink-500/30 font-mono">
          {mode}
        </span>
      </div>

      {activePattern && (
        <div
          key={activePattern}
          className="absolute top-3 right-4 flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-400/40 rounded-full text-xs animate-fade-in-down"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-purple-200 font-semibold">{activePattern}</span>
        </div>
      )}

      {error && (
        <div className="text-red-400 text-xs mb-1 font-mono">{error}</div>
      )}
      {lastAction && (
        <div className="text-slate-500 text-xs mb-2 font-mono truncate">
          {lastAction}
        </div>
      )}

      <div
        key={display}
        className="text-right font-mono text-4xl md:text-5xl font-bold text-white break-all leading-tight animate-scale-in"
      >
        {display}
      </div>
    </div>
  );
}
