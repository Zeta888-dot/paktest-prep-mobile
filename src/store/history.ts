import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./auth";
import { apiFetch } from "../lib/api";

export type HistorySource = "syllabus" | "material" | "subjective" | "mock";

export type HistoryRow = {
  id: string;
  testName: string;
  source: HistorySource;
  correct: number;
  total: number;
  duration: number | null; // seconds
  createdAt: string; // ISO
};

type HistoryState = {
  rows: HistoryRow[];
  loaded: boolean;
};

type Actions = {
  load: () => Promise<void>;
  addAttempt: (attempt: Omit<HistoryRow, "id" | "createdAt">) => Promise<void>;
  clearAll: () => Promise<void>;
};

const STORAGE_KEY = "@paktest/history";

export const useHistory = create<HistoryState & Actions>((set, get) => ({
  rows: [],
  loaded: false,

  load: async () => {
    const token = useAuth.getState().token;

    if (token) {
      try {
        const res = await apiFetch("/api/history");
        const data = await res.json();
        const rows: HistoryRow[] = (data.history ?? []).map((r: any) => ({
          id: r.id,
          testName: r.testName,
          source: r.source,
          correct: r.correct,
          total: r.total,
          duration: r.duration,
          createdAt: r.createdAt,
        }));
        set({ rows, loaded: true });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
        return;
      } catch {
        // offline or backend error -> fall back to local cache below
      }
    }

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const rows: HistoryRow[] = data ? JSON.parse(data) : [];
      set({ rows, loaded: true });
    } catch {
      set({ rows: [], loaded: true });
    }
  },

  addAttempt: async (attempt) => {
    const row: HistoryRow = {
      ...attempt,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    const next = [row, ...get().rows];
    set({ rows: next });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    const token = useAuth.getState().token;
    if (token) {
      try {
        await apiFetch("/api/history", {
          method: "POST",
          body: JSON.stringify({
            testName: attempt.testName,
            source: attempt.source,
            correct: attempt.correct,
            total: attempt.total,
            duration: attempt.duration,
          }),
        });
      } catch {
        // offline or backend error - local copy is already saved
      }
    }
  },

  clearAll: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ rows: [], loaded: true });
  },
}));