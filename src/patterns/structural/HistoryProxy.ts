
import type { HistoryEntry } from '../../types';

export interface HistoryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const STORAGE_KEY = 'design-pattern-calculator.history.v1';

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.id === 'string' && typeof entry.expression === 'string' &&
    typeof entry.result === 'string' && typeof entry.timestamp === 'string' &&
    typeof entry.error === 'boolean';
}

export class HistoryProxy {
  private history: HistoryEntry[] = [];
  private cache: Map<string, HistoryEntry[]> = new Map();
  private readonly maxSize = 50;
  private readonly storage?: HistoryStorage;

  constructor(storage?: HistoryStorage) {
    this.storage = storage;
    try {
      const saved = storage?.getItem(STORAGE_KEY);
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed)) this.history = parsed.filter(isHistoryEntry).slice(0, this.maxSize);
    } catch {
      // Storage can be unavailable or contain invalid data; keep an in-memory history.
    }
  }

  private persist(): void {
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.history));
    } catch {
      // The calculator remains usable if browser storage is unavailable or full.
    }
  }

  add(entry: HistoryEntry): void {
    this.history.unshift(entry);
    if (this.history.length > this.maxSize) {
      this.history.pop();
    }
    this.invalidateCache();
    this.persist();
    console.log(`[Proxy] Entry added. Cache invalidated. Total: ${this.history.length}`);
  }

  private invalidateCache(): void {
    this.cache.clear();
  }

  query(filter: 'all' | 'errors' | string = 'all'): HistoryEntry[] {
    const cacheKey = `filter:${filter}`;
    
    if (this.cache.has(cacheKey)) {
      console.log(`[Proxy] Cache HIT for: ${filter}`);
      return [...this.cache.get(cacheKey)!];
    }

    console.log(`[Proxy] Cache MISS for: ${filter}`);
    let result: HistoryEntry[];

    if (filter === 'all') {
      result = this.history;
    } else if (filter === 'errors') {
      result = this.history.filter((h) => h.error);
    } else {
      result = this.history.filter((h) => h.expression.includes(filter));
    }

    this.cache.set(cacheKey, [...result]);
    return [...result];
  }

  getAll(): HistoryEntry[] {
    return [...this.history];
  }

  clear(): void {
    this.history = [];
    this.invalidateCache();
    this.persist();
    console.log('[Proxy] History cleared');
  }

  size(): number {
    return this.history.length;
  }
}
