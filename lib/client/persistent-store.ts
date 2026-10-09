/**
 * Store mínimo persistido em localStorage, consumido com useSyncExternalStore.
 * Sincroniza entre abas (evento "storage") e é seguro no SSR.
 */
export type PersistentStore<T> = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (next: T) => void;
  update: (fn: (current: T) => T) => void;
};

export function createPersistentStore<T>(
  key: string,
  initial: T,
  parse: (raw: unknown) => T,
): PersistentStore<T> {
  let cache: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  function read(): T {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? parse(JSON.parse(raw)) : initial;
    } catch {
      return initial;
    }
  }

  function emit() {
    listeners.forEach((listener) => listener());
  }

  function onStorage(event: StorageEvent) {
    if (event.key !== key) return;
    cache = read();
    emit();
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1 && typeof window !== "undefined") window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && typeof window !== "undefined") window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot() {
      if (!loaded) {
        cache = read();
        loaded = true;
      }
      return cache;
    },
    getServerSnapshot() {
      return initial;
    },
    set(next) {
      cache = next;
      loaded = true;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Armazenamento indisponível (modo privado): mantém só em memória
      }
      emit();
    },
    update(fn) {
      this.set(fn(this.getSnapshot()));
    },
  };
}
