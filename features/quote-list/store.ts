"use client";

import { useSyncExternalStore } from "react";
import { createPersistentStore } from "@/lib/client/persistent-store";
import {
  addItem,
  EMPTY_QUOTE_LIST,
  parseQuoteList,
  removeItem,
  updateQuantity,
  type QuoteItem,
  type QuoteList,
} from "./model";

const store = createPersistentStore<QuoteList>("cerigatto:quote-list:v1", EMPTY_QUOTE_LIST, parseQuoteList);

export function useQuoteList(): QuoteList {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

export const quoteListActions = {
  add(item: Omit<QuoteItem, "addedAt">) {
    store.update((list) => addItem(list, item));
  },
  remove(key: string) {
    store.update((list) => removeItem(list, key));
  },
  setQuantity(key: string, quantity: number) {
    store.update((list) => updateQuantity(list, key, quantity));
  },
  setNote(note: string) {
    store.update((list) => ({ ...list, note: note.slice(0, 1000) }));
  },
  clear() {
    store.set(EMPTY_QUOTE_LIST);
  },
};
