
export interface Command {
  execute(): void;
  undo(): void;
  description: string;
}

export class CommandInvoker {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private readonly maxHistory = 50;

  execute(cmd: Command): void {
    cmd.execute();
    this.undoStack.push(cmd);
    this.redoStack = []; 
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    console.log(`[Command] Executed: ${cmd.description}`);
  }

  undo(): boolean {
    const cmd = this.undoStack.pop();
    if (!cmd) return false;
    cmd.undo();
    this.redoStack.push(cmd);
    console.log(`[Command] Undo: ${cmd.description}`);
    return true;
  }

  redo(): boolean {
    const cmd = this.redoStack.pop();
    if (!cmd) return false;
    cmd.execute();
    this.undoStack.push(cmd);
    console.log(`[Command] Redo: ${cmd.description}`);
    return true;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}