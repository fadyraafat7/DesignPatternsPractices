import assert from "node:assert/strict";
import { test, after } from "node:test";
import { createServer } from "vite";
import React, { act } from "react";
import { create } from "react-test-renderer";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
after(() => server.close());
const { StateMachine } = await server.ssrLoadModule("/src/patterns/behavioral/State.ts");
const { CalculatorFacade } = await server.ssrLoadModule("/src/patterns/structural/CalculatorFacade.ts");
const { CommandInvoker } = await server.ssrLoadModule("/src/patterns/behavioral/Command.ts");
const { HistoryProxy } = await server.ssrLoadModule("/src/patterns/structural/HistoryProxy.ts");
const { CalculatorEngine } = await server.ssrLoadModule("/src/patterns/creational/CalculatorEngine.ts");
const { useCalculator } = await server.ssrLoadModule("/src/hooks/useCalculator.ts");
const { handleInputWithSwitch } = await server.ssrLoadModule("/examples/input-with-switch.ts");

test("state machine builds a decimal expression starting from zero", () => {
  const machine = new StateMachine();
  const ctx = { display: "0", leftOperand: null, currentOperator: null, rightDisplay: "", error: null, setState: (name) => machine.setState(name) };
  machine.getCurrent().handleOperator(ctx, "+");
  machine.getCurrent().handleInput(ctx, ".");
  machine.getCurrent().handleInput(ctx, "5");
  assert.equal(ctx.display, "0 + 0.5");
  assert.equal(new CalculatorFacade().calculateBinary(ctx.leftOperand, ctx.currentOperator, Number(ctx.rightDisplay)), 0.5);
});

test("switch experiment agrees with State input behavior across calculator states", () => {
  const scenarios = [
    ["idle", "0", "", "."], ["input", "1.2", "", "."],
    ["input", "0", "", "3"], ["operator", "5 + ", "", "."],
    ["operator", "5 + 0", "0", "3"], ["result", "8", "", "4"],
    ["error", "Error", "", "2"],
  ];
  for (const [state, display, rightDisplay, value] of scenarios) {
    const run = (useSwitch) => {
      const machine = new StateMachine();
      machine.setState(state);
      const ctx = { display, leftOperand: 5, currentOperator: "+", rightDisplay, error: null, setState: (name) => machine.setState(name) };
      const accepted = useSwitch ? handleInputWithSwitch(state, ctx, value) : machine.getCurrent().handleInput(ctx, value);
      const { setState: _setState, ...values } = ctx;
      return { accepted, state: machine.getStateName(), ...values };
    };
    assert.deepEqual(run(true), run(false));
  }
});

test("scientific and remainder calculations validate invalid results", () => {
  const calc = new CalculatorFacade();
  assert.equal(calc.calculateBinary(2, "^", 3), 8);
  assert.equal(calc.calculateBinary(7, "%", 4), 3);
  assert.equal(calc.calculateUnary(9, "√"), 3);
  assert.throws(() => calc.calculateBinary(7, "%", 0), /zero/);
  assert.throws(() => calc.calculateUnary(-1, "√"), /negative/);
  assert.throws(() => calc.calculateBinary(1e200, "^", 2), /finite/);
});

test("command history supports undo, redo, and invalidates redo after a new action", () => {
  const invoker = new CommandInvoker();
  let value = 0;
  const command = (amount) => ({ description: "add", execute: () => { value += amount; }, undo: () => { value -= amount; } });
  invoker.execute(command(2));
  invoker.undo();
  assert.equal(value, 0);
  assert.equal(invoker.canRedo(), true);
  invoker.redo();
  assert.equal(value, 2);
  invoker.undo();
  invoker.execute(command(3));
  assert.equal(value, 3);
  assert.equal(invoker.canRedo(), false);
});

test("history survives a new instance, validates stored data, and clears persistently", () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const entry = { id: "1", expression: "5 + 3", result: "8", timestamp: "12:00", error: false };
  const history = new HistoryProxy(storage);
  history.add(entry);
  const reloaded = new HistoryProxy(storage);
  assert.deepEqual(reloaded.getAll(), [entry]);
  reloaded.getAll().pop();
  assert.equal(reloaded.size(), 1);
  reloaded.clear();
  assert.equal(new HistoryProxy(storage).size(), 0);
  for (const key of values.keys()) values.set(key, "invalid JSON");
  assert.equal(new HistoryProxy(storage).size(), 0);
  const unavailable = { getItem() { throw new Error("unavailable"); }, setItem() { throw new Error("unavailable"); } };
  const fallback = new HistoryProxy(unavailable);
  fallback.add(entry);
  assert.equal(fallback.size(), 1);
});

test("singleton precision is shared across facades", () => {
  const engine = CalculatorEngine.getInstance();
  const precision = engine.getPrecision();
  try {
    const first = new CalculatorFacade();
    const second = new CalculatorFacade();
    engine.setPrecision(2);
    assert.equal(first.formatResult(1.2345), "1.23");
    assert.equal(second.formatResult(1.2345), "1.23");
  } finally {
    engine.setPrecision(precision);
  }
});

test("calculator actions, undo, redo, errors, and persisted history", async () => {
  const stored = new Map();
  const previousWindow = globalThis.window;
  const previousActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.window = {
    localStorage: { getItem: (key) => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value) },
    addEventListener() {}, removeEventListener() {}, setTimeout,
  };
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let calculator;
  let renderer;
  function Harness() {
    calculator = useCalculator();
    return null;
  }
  const action = async (fn) => { await act(() => fn()); };
  try {
    await act(() => { renderer = create(React.createElement(Harness)); });
    await action(() => calculator.handleNumber("5"));
    await action(() => calculator.handleOperator("+"));
    await action(() => calculator.handleNumber("3"));
    await action(() => calculator.handleEquals());
    assert.equal(calculator.display, "8");
    assert.equal(calculator.history.length, 1);
    await action(() => calculator.handleUndo());
    assert.equal(calculator.display, "5 + 3");
    await action(() => calculator.handleRedo());
    assert.equal(calculator.display, "8");
    assert.equal(calculator.history.length, 1);

    await action(() => calculator.handleClear());
    await action(() => calculator.handleNumber("9"));
    await action(() => calculator.handleToggleSign());
    assert.equal(calculator.display, "-9");
    await action(() => calculator.handleUndo());
    assert.equal(calculator.display, "9");
    await action(() => calculator.handleScientific("√"));
    assert.equal(calculator.display, "3");
    await action(() => calculator.handleUndo());
    assert.equal(calculator.display, "9");
    await action(() => calculator.handleRedo());
    assert.equal(calculator.display, "3");
    assert.equal(calculator.history.length, 2);

    await action(() => calculator.handleClear());
    await action(() => calculator.handleNumber("5"));
    await action(() => calculator.handleOperator("/"));
    await action(() => calculator.handleNumber("0"));
    await action(() => calculator.handleEquals());
    assert.match(calculator.error, /zero/);
    await action(() => calculator.handleUndo());
    assert.equal(calculator.error, null);
    assert.equal(calculator.display, "5 / 0");
    await act(() => renderer.unmount());
    await act(() => { renderer = create(React.createElement(Harness)); });
    assert.equal(calculator.history.length, 3);
    await action(() => calculator.clearHistory());
    await act(() => renderer.unmount());
    await act(() => { renderer = create(React.createElement(Harness)); });
    assert.equal(calculator.history.length, 0);
  } finally {
    if (renderer) await act(() => renderer.unmount());
    globalThis.window = previousWindow;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  }
});
