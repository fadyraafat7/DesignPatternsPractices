export type ObserverCallback<T> = (data: T) => void;

export class CalculatorObserver<T = unknown> {
  private observers: Set<ObserverCallback<T>> = new Set();

  subscribe(callback: ObserverCallback<T>): () => void {
    this.observers.add(callback);
    console.log(`[Observer] Subscriber added: ${this.observers.size}`);
    return () => {
      this.observers.delete(callback);
      console.log(`[Observer] Subscriber removed: ${this.observers.size}`);
    };
  }

  notify(data: T): void {
    console.log(`[Observer] Notifying ${this.observers.size} subscribers`);
    this.observers.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error("[Observer] Subscriber error:", err);
      }
    });
  }

  clear(): void {
    this.observers.clear();
  }
}

export interface CalcEvent {
  type: "display" | "history" | "mode" | "error" | "state" | "result";
  payload: unknown;
}