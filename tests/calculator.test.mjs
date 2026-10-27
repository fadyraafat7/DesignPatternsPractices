import assert from "node:assert/strict";
import { test, after } from "node:test";
import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
after(() => server.close());
const { StateMachine } = await server.ssrLoadModule("/src/patterns/behavioral/State.ts");
const { CalculatorFacade } = await server.ssrLoadModule("/src/patterns/structural/CalculatorFacade.ts");
const { CommandInvoker } = await server.ssrLoadModule("/src/patterns/behavioral/Command.ts");

test("state machine builds a decimal expression starting from zero", () => {
  const machine = new StateMachine();
  const ctx = { display: "0", leftOperand: null, currentOperator: null, rightDisplay: "", error: null, setState: (name) => machine.setState(name) };
  machine.getCurrent().handleOperator(ctx, "+");
  machine.getCurrent().handleInput(ctx, ".");
  machine.getCurrent().handleInput(ctx, "5");
  assert.equal(ctx.display, "0 + 0.5");
  assert.equal(new CalculatorFacade().calculateBinary(ctx.leftOperand, ctx.currentOperator, Number(ctx.rightDisplay)), 0.5);
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
