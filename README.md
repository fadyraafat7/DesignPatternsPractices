# Design Patterns Practices (TypeScript)

A small TypeScript playground for practicing classic design patterns.

## Getting started

Install dependencies with `npm install`, then start the app with `npm run dev`. Run `npm run build` for a production build, `npm test` for the calculator tests, and `npm run lint` to check the code.

The calculator supports basic arithmetic, undo and redo, a history panel, and scientific functions. Use the Scientific button for powers, square roots, trigonometry (in degrees), and logarithms. `%` calculates the remainder of a division, and `^` raises the first number to the power of the second.

You can use the number keys, `+`, `-`, `*`, `/`, Enter or `=`, Backspace, and Escape. Undo and redo are available with Ctrl+Z and Ctrl+Y.

The project demonstrates design patterns including State, Command, Strategy, Factory, Builder, Decorator, Facade, Observer, Proxy, and Singleton.

## Learning the patterns

For each pattern, trace the files listed below while entering `5 + 3 =`. The pattern names shown in the UI are educational hints, not a complete trace of every object involved.

| Pattern | Problem and example in this project | Trade-off |
| --- | --- | --- |
| State | [State.ts](src/patterns/behavioral/State.ts) changes input behavior depending on whether the calculator is idle, accepting a number, waiting for an operand, showing a result, or in error. | Adding a state is explicit, but requires more classes and transitions. |
| Command | [Command.ts](src/patterns/behavioral/Command.ts) stores actions with `execute` and `undo`; [useCalculator.ts](src/hooks/useCalculator.ts) captures the previous calculator state. | Undo requires careful snapshots and a decision about side effects such as history. |
| Strategy | [Strategy.ts](src/patterns/behavioral/Strategy.ts) models basic and scientific operation sets. The hook switches the strategy when changing mode. | The keypad currently defines its own buttons, so the strategy does not yet drive which buttons appear. Connecting it would make the pattern more useful. |
| Factory | [OperationFactory.ts](src/patterns/creational/OperationFactory.ts) creates the requested operation without exposing its concrete class to the facade. | A central registry must be updated when adding an operation. |
| Builder | [ExpressionBuilder.ts](src/patterns/creational/ExpressionBuilder.ts) validates and constructs an expression in steps. | For a small expression, a plain function could be simpler. |
| Decorator | [OperationDecorators.ts](src/patterns/structural/OperationDecorators.ts) wraps operations with validation and logging. | Wrappers add indirection; their order matters. |
| Facade | [CalculatorFacade.ts](src/patterns/structural/CalculatorFacade.ts) provides calculation methods that coordinate the factory, builder, decorators, and engine. | A facade can hide useful detail or grow too large if it takes on unrelated work. |
| Observer | [Observer.ts](src/patterns/behavioral/Observer.ts) lets subscribers receive calculator events without the sender knowing each listener. | Subscriptions need cleanup, and event flow can be harder to trace. |
| Proxy | [HistoryProxy.ts](src/patterns/structural/HistoryProxy.ts) controls history access and caches queries. It also persists history through a storage interface. | Here it is a practical cache/storage wrapper rather than a strict proxy for a separate history object; this distinction is worth discussing. |
| Singleton | [CalculatorEngine.ts](src/patterns/creational/CalculatorEngine.ts) shares one engine across facades. | Shared mutable precision, memory, and current value can leak between consumers and tests. |

### Try replacing State

Compare the production state classes with [the switch experiment](examples/input-with-switch.ts). It replaces only number input handling and is not used by the app. An automated test compares the two implementations across representative states. Try adding a state such as `editing-result` to both: the switch version may be easier for a small calculator; State becomes useful when each state's behavior and transitions grow. Expand the experiment and its tests before comparing operator, equals, and clear behavior.

### Experiment with Singleton

Create two facades, set the engine's precision through `CalculatorEngine.getInstance()`, and observe that both use the same precision. Restore the original precision after the experiment so other tests are not affected. Then consider injecting an engine into each facade: separate instances would make tests and multiple calculators independent, while sharing an instance deliberately could still be supported. A singleton is useful when shared state is a real requirement, but this calculator does not currently demonstrate a need for globally shared memory or precision.

## History and undo

History is stored in this browser's local storage, up to 50 entries. Clearing history also clears the saved entries. If storage is unavailable or invalid, the calculator continues with an in-memory history. The panel displays the 15 most recent entries.

Undo and redo restore calculator input and state for the current session. History is an activity log: undo does not erase an already recorded calculation, and redo does not add a duplicate entry. Undo/redo stacks are not persisted across reloads.
