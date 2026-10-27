import { useState, useRef, useCallback, useEffect } from "react";
import { CalculatorFacade } from "../patterns/structural/CalculatorFacade";
import { HistoryProxy } from "../patterns/structural/HistoryProxy";
import { CommandInvoker, type Command } from "../patterns/behavioral/Command";
import {
  CalculatorObserver,
  type CalcEvent,
} from "../patterns/behavioral/Observer";
import { StateMachine } from "../patterns/behavioral/State";
import {
  StrategyContext,
  BasicStrategy,
  ScientificStrategy,
} from "../patterns/behavioral/Strategy";
import type {
  CalcContext,
  CalcMode,
  CalcStateName,
  HistoryEntry,
  OperationSymbol,
} from "../types";

interface Snapshot {
  display: string;
  leftOperand: number | null;
  currentOperator: OperationSymbol | null;
  rightDisplay: string;
  error: string | null;
  stateName: CalcStateName;
}

export function useCalculator() {
  const [historyProxy] = useState(() => {
    try {
      return new HistoryProxy(window.localStorage);
    } catch {
      return new HistoryProxy();
    }
  });
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState<HistoryEntry[]>(() => historyProxy.getAll());
  const [mode, setMode] = useState<CalcMode>("BASIC");
  const [stateName, setStateName] = useState<CalcStateName>("idle");
  const [error, setError] = useState<string | null>(null);
  const [activePattern, setActivePattern] = useState<string | null>(null);
  const [commandAvailability, setCommandAvailability] = useState({ canUndo: false, canRedo: false });
  const patternTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const facadeRef = useRef(new CalculatorFacade());
  const commandInvokerRef = useRef(new CommandInvoker());
  const observerRef = useRef(new CalculatorObserver<CalcEvent>());
  const stateMachineRef = useRef(new StateMachine());
  const strategyContextRef = useRef(new StrategyContext(new BasicStrategy()));

  const ctxRef = useRef<CalcContext>({
    display: "0",
    leftOperand: null,
    currentOperator: null,
    rightDisplay: "",
    error: null,
    setState: (name) => {
      stateMachineRef.current.setState(name);
      setStateName(name);
    },
  });

  const flashPattern = useCallback((name: string) => {
    if (patternTimerRef.current) clearTimeout(patternTimerRef.current);
    setActivePattern(name);
    patternTimerRef.current = setTimeout(() => setActivePattern(null), 1500);
  }, []);

  useEffect(() => () => {
    if (patternTimerRef.current) clearTimeout(patternTimerRef.current);
  }, []);

  const updateCommandAvailability = useCallback(() => {
    setCommandAvailability({
      canUndo: commandInvokerRef.current.canUndo(),
      canRedo: commandInvokerRef.current.canRedo(),
    });
  }, []);

  const executeCommand = useCallback((command: Command) => {
    commandInvokerRef.current.execute(command);
    updateCommandAvailability();
  }, [updateCommandAvailability]);

  const takeSnapshot = useCallback(
    (): Snapshot => ({
      display: ctxRef.current.display,
      leftOperand: ctxRef.current.leftOperand,
      currentOperator: ctxRef.current.currentOperator,
      rightDisplay: ctxRef.current.rightDisplay,
      error: ctxRef.current.error,
      stateName: stateMachineRef.current.getStateName(),
    }),
    [],
  );

  const restoreSnapshot = useCallback((snap: Snapshot) => {
    ctxRef.current.display = snap.display;
    ctxRef.current.leftOperand = snap.leftOperand;
    ctxRef.current.currentOperator = snap.currentOperator;
    ctxRef.current.rightDisplay = snap.rightDisplay;
    ctxRef.current.error = snap.error;
    stateMachineRef.current.setState(snap.stateName);
    setStateName(snap.stateName);
    setDisplay(snap.display);
    setError(snap.error);
  }, []);

  const addToHistory = useCallback((entry: HistoryEntry) => {
    historyProxy.add(entry);
    setHistory(historyProxy.getAll());
  }, [historyProxy]);

  const handleNumber = useCallback(
    (num: string) => {
      flashPattern("State");
      const snap = takeSnapshot();
      const cmd: Command = {
        description: `Input ${num}`,
        execute: () => {
          const ok = stateMachineRef.current
            .getCurrent()
            .handleInput(ctxRef.current, num);
          if (ok) {
            setDisplay(ctxRef.current.display);
            observerRef.current.notify({
              type: "display",
              payload: ctxRef.current.display,
            });
          }
        },
        undo: () => restoreSnapshot(snap),
      };
      executeCommand(cmd);
    },
    [flashPattern, takeSnapshot, restoreSnapshot, executeCommand],
  );

  const handleOperator = useCallback(
    (op: OperationSymbol) => {
      flashPattern("Factory");
      const snap = takeSnapshot();
      const cmd: Command = {
        description: `Operator ${op}`,
        execute: () => {
          const ok = stateMachineRef.current
            .getCurrent()
            .handleOperator(ctxRef.current, op);
          if (ok) {
            setDisplay(ctxRef.current.display);
            window.setTimeout(() => flashPattern("Decorator"), 200);
          }
        },
        undo: () => restoreSnapshot(snap),
      };
      executeCommand(cmd);
    },
    [flashPattern, takeSnapshot, restoreSnapshot, executeCommand],
  );

  const handleEquals = useCallback(() => {
    flashPattern("Facade");
    const ctx = ctxRef.current;
    if (
      stateMachineRef.current.getStateName() !== "operator" ||
      ctx.rightDisplay === ""
    ) {
      return;
    }
    const snap = takeSnapshot();
    let recorded = false;

    const record = (entry: HistoryEntry) => {
      if (!recorded) {
        addToHistory(entry);
        recorded = true;
      }
    };

    const cmd: Command = {
      description: "Equals",
      execute: () => {
        try {
          stateMachineRef.current.getCurrent().handleEquals(ctx);
          const right = parseFloat(ctx.rightDisplay);
          const result = facadeRef.current.calculateBinary(
            ctx.leftOperand as number,
            ctx.currentOperator as OperationSymbol,
            right,
          );
          const formatted = facadeRef.current.formatResult(result);
          const expression = `${ctx.leftOperand} ${ctx.currentOperator} ${right}`;

          record({
            id: crypto.randomUUID(),
            expression,
            result: formatted,
            timestamp: new Date().toLocaleTimeString(),
            error: false,
          });

          observerRef.current.notify({ type: "result", payload: formatted });
          setDisplay(formatted);
          ctx.display = formatted;
          ctx.leftOperand = null;
          ctx.currentOperator = null;
          ctx.rightDisplay = "";
          setError(null);
          stateMachineRef.current.setState("result");
          setStateName("result");
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          stateMachineRef.current.setState("error");
          setStateName("error");
          ctx.error = message;
          setError(message);
          setDisplay("Error");
          record({
            id: crypto.randomUUID(),
            expression: `${ctx.leftOperand} ${ctx.currentOperator} ${ctx.rightDisplay}`,
            result: message,
            timestamp: new Date().toLocaleTimeString(),
            error: true,
          });
        }
      },
      undo: () => restoreSnapshot(snap),
    };
    executeCommand(cmd);
  }, [flashPattern, takeSnapshot, restoreSnapshot, addToHistory, executeCommand]);

  const handleClear = useCallback(() => {
    flashPattern("Command");
    const snap = takeSnapshot();
    const cmd: Command = {
      description: "Clear",
      execute: () => {
        stateMachineRef.current.getCurrent().handleClear(ctxRef.current);
        setStateName(stateMachineRef.current.getStateName());
        setDisplay("0");
        setError(null);
      },
      undo: () => restoreSnapshot(snap),
    };
    executeCommand(cmd);
  }, [flashPattern, takeSnapshot, restoreSnapshot, executeCommand]);

  const handleBackspace = useCallback(() => {
    const ctx = ctxRef.current;
    const state = stateMachineRef.current.getStateName();
    if ((state !== "operator" || !ctx.rightDisplay) && state !== "input") return;
    const snap = takeSnapshot();
    executeCommand({
      description: "Backspace",
      execute: () => {
        if (state === "operator") {
          ctx.rightDisplay = ctx.rightDisplay.slice(0, -1);
          if (ctx.rightDisplay === "-") ctx.rightDisplay = "";
          ctx.display = `${ctx.leftOperand} ${ctx.currentOperator} ${ctx.rightDisplay}`;
        } else {
          ctx.display = ctx.display.slice(0, -1);
          if (!ctx.display || ctx.display === "-") ctx.display = "0";
        }
        setDisplay(ctx.display);
      },
      undo: () => restoreSnapshot(snap),
    });
  }, [executeCommand, takeSnapshot, restoreSnapshot]);

  const handleScientific = useCallback(
    (fn: OperationSymbol) => {
      flashPattern("Strategy");
      const ctx = ctxRef.current;
      const state = stateMachineRef.current.getStateName();
      if (state === "error" || (state === "operator" && !ctx.rightDisplay)) return;
      const value = Number(state === "operator" ? ctx.rightDisplay : ctx.display);
      const snap = takeSnapshot();
      let recorded = false;
      const record = (entry: HistoryEntry) => {
        if (!recorded) {
          addToHistory(entry);
          recorded = true;
        }
      };

      const cmd: Command = {
        description: `Scientific ${fn}`,
        execute: () => {
          try {
            const result = facadeRef.current.calculateUnary(value, fn);
            const formatted = facadeRef.current.formatResult(result);
            const expression = `${fn}(${value})`;
            record({
              id: crypto.randomUUID(),
              expression,
              result: formatted,
              timestamp: new Date().toLocaleTimeString(),
              error: false,
            });
            ctx.error = null;
            setError(null);
            if (state === "operator") {
              ctx.rightDisplay = formatted;
              ctx.display = `${ctx.leftOperand} ${ctx.currentOperator} ${formatted}`;
            } else {
              ctx.display = formatted;
              stateMachineRef.current.setState("result");
              setStateName("result");
            }
            setDisplay(ctx.display);
          } catch (err) {
            const message = err instanceof Error ? err.message : "Error";
            ctx.error = message;
            stateMachineRef.current.setState("error");
            setStateName("error");
            setError(message);
            setDisplay("Error");
            record({
              id: crypto.randomUUID(),
              expression: `${fn}(${value})`,
              result: message,
              timestamp: new Date().toLocaleTimeString(),
              error: true,
            });
          }
        },
        undo: () => restoreSnapshot(snap),
      };
      executeCommand(cmd);
    },
    [flashPattern, addToHistory, takeSnapshot, restoreSnapshot, executeCommand],
  );

  const handleToggleSign = useCallback(() => {
    const ctx = ctxRef.current;
    const state = stateMachineRef.current.getStateName();
    if (state === "error" || state === "idle" || (state === "operator" && !ctx.rightDisplay)) return;
    const snap = takeSnapshot();
    executeCommand({
      description: "Toggle sign",
      execute: () => {
        const value = state === "operator" ? ctx.rightDisplay : ctx.display;
        const next = value.startsWith("-") ? value.slice(1) : `-${value}`;
        if (state === "operator") {
          ctx.rightDisplay = next;
          ctx.display = `${ctx.leftOperand} ${ctx.currentOperator} ${next}`;
        } else {
          ctx.display = next;
        }
        setDisplay(ctx.display);
      },
      undo: () => restoreSnapshot(snap),
    });
  }, [executeCommand, takeSnapshot, restoreSnapshot]);

  const handleUndo = useCallback(() => {
    flashPattern("Command");
    commandInvokerRef.current.undo();
    updateCommandAvailability();
  }, [flashPattern, updateCommandAvailability]);

  const handleRedo = useCallback(() => {
    flashPattern("Command");
    commandInvokerRef.current.redo();
    updateCommandAvailability();
  }, [flashPattern, updateCommandAvailability]);

  const toggleMode = useCallback(() => {
    flashPattern("Strategy");
    setMode((m) => {
      const newMode: CalcMode = m === "BASIC" ? "SCIENTIFIC" : "BASIC";
      strategyContextRef.current.setStrategy(
        newMode === "BASIC" ? new BasicStrategy() : new ScientificStrategy(),
      );
      observerRef.current.notify({ type: "mode", payload: newMode });
      return newMode;
    });
  }, [flashPattern]);

  const clearHistory = useCallback(() => {
    historyProxy.clear();
    setHistory([]);
  }, [historyProxy]);

  useEffect(() => {
    const unsubscribe = observerRef.current.subscribe((event) => {
      console.log("Event received:", event);

      if (event.type === "result") {
        console.log("Calculation:", event.payload);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName)) return;

      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) handleNumber(e.key);
      else if (e.key === ".") handleNumber(".");
      else if (e.key === "+") handleOperator("+");
      else if (e.key === "-") handleOperator("-");
      else if (e.key === "*") handleOperator("*");
      else if (e.key === "/") {
        e.preventDefault();
        handleOperator("/");
      } else if (e.key === "Enter" || e.key === "=") handleEquals();
      else if (e.key === "Escape") handleClear();
      else if (e.key === "Backspace") handleBackspace();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [
    handleNumber,
    handleOperator,
    handleEquals,
    handleClear,
    handleBackspace,
    handleUndo,
    handleRedo,
  ]);

  return {
    display,
    history,
    mode,
    stateName,
    error,
    activePattern,
    handleNumber,
    handleOperator,
    handleEquals,
    handleClear,
    handleBackspace,
    handleScientific,
    handleToggleSign,
    handleUndo,
    handleRedo,
    toggleMode,
    clearHistory,
    ...commandAvailability,
  };
}
