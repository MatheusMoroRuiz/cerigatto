"use client";

import { useSyncExternalStore } from "react";
import { z } from "zod";
import { createPersistentStore } from "@/lib/client/persistent-store";

/** Favoritos sem login, salvos no navegador (somente IDs). */
const MAX_FAVORITES = 200;

const store = createPersistentStore<string[]>("cerigatto:favorites:v1", [], (raw) => {
  const parsed = z.array(z.string().min(1).max(64)).safeParse(raw);
  return parsed.success ? [...new Set(parsed.data)].slice(0, MAX_FAVORITES) : [];
});

export function useFavorites(): string[] {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

export const favoritesActions = {
  toggle(productId: string): boolean {
    const current = store.getSnapshot();
    const exists = current.includes(productId);
    store.set(exists ? current.filter((id) => id !== productId) : [productId, ...current].slice(0, MAX_FAVORITES));
    return !exists;
  },
  remove(productId: string) {
    store.update((current) => current.filter((id) => id !== productId));
  },
  clear() {
    store.set([]);
  },
};
