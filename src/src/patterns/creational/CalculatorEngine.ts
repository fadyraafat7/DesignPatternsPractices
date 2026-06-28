
export class CalculatorEngine {
  private static instance: CalculatorEngine | null = null;

  private currentValue: number = 0;
  private memory: number = 0;
  private precision: number = 10;

  private constructor() {
    console.log('[Singleton] CalculatorEngine instance created');
  }

  public static getInstance(): CalculatorEngine {
    if (!CalculatorEngine.instance) {
      CalculatorEngine.instance = new CalculatorEngine();
    }
    return CalculatorEngine.instance;
  }

  public getCurrentValue(): number {
    return this.currentValue;
  }

  public setCurrentValue(value: number): void {
    this.currentValue = value;
  }

  public getMemory(): number {
    return this.memory;
  }

  public setMemory(value: number): void {
    this.memory = value;
  }

  public memoryAdd(value: number): void {
    this.memory += value;
  }

  public memoryClear(): void {
    this.memory = 0;
  }

  public getPrecision(): number {
    return this.precision;
  }

  public setPrecision(p: number): void {
    this.precision = Math.max(1, Math.min(15, p));
  }
}