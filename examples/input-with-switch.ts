import type { CalcContext, CalcStateName } from "../src/types";

// An alternative to StateMachine.getCurrent().handleInput, kept as an experiment.
export function handleInputWithSwitch(state: CalcStateName, ctx: CalcContext, value: string): boolean {
  switch (state) {
    case "idle":
    case "result":
      ctx.display = value === "." ? "0." : value;
      if (state === "result") {
        ctx.leftOperand = null;
        ctx.currentOperator = null;
        ctx.rightDisplay = "";
      }
      ctx.setState("input");
      return true;
    case "input":
      if (value === "." && ctx.display.includes(".")) return false;
      ctx.display = ctx.display === "0" && value !== "." ? value : ctx.display + value;
      return true;
    case "operator":
      if (value === "." && ctx.rightDisplay.includes(".")) return false;
      if (ctx.rightDisplay === "" && value === ".") ctx.rightDisplay = "0.";
      else if (ctx.rightDisplay === "0" && value !== ".") ctx.rightDisplay = value;
      else ctx.rightDisplay += value;
      ctx.display = `${ctx.leftOperand} ${ctx.currentOperator} ${ctx.rightDisplay}`;
      return true;
    case "error":
      return false;
  }
}
