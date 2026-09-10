import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SavedQuestion = {
  id: string;
  test: string;
  question: string;
  savedAt: string;
  options?: string[];
  answer?: string;
  explanation?: string;
};

type BookmarksState = {
  saved: SavedQuestion[];
  loaded: boolean;
};

type Actions = {
  load: () => Promise<void>;
  toggleSaved: (
    test: string,
    question: string,
    extra?: { options: string[]; answer: string; explanation: string }
  ) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

const STORAGE_KEY = "@paktest/saved-questions";

export const useBookmarks = create<BookmarksState & Actions>((set, get) => ({
  saved: [],
  loaded: false,

  load: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const saved: SavedQuestion[] = data ? JSON.parse(data) : [];
      set({ saved, loaded: true });
    } catch {
      set({ saved: [], loaded: true });
    }
  },

  toggleSaved: async (test, question, extra) => {
    const list = get().saved;
    const exists = list.find((b) => b.test === test && b.question === question);
    const next = exists
      ? list.filter((b) => b.id !== exists.id)
      : [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            test,
            question,
            savedAt: new Date().toISOString(),
            ...extra,
          },
          ...list,
        ];
    set({ saved: next });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },

  remove: async (id) => {
    const next = get().saved.filter((b) => b.id !== id);
    set({ saved: next });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },
}));