import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Theme = "dark" | "light" | "system";

type Settings = {
  displayName: string;
  apiKey: string;
  questionsPerTest: number;
  defaultSource: "syllabus" | "material";
  theme: Theme;
  loaded: boolean;
};

type Actions = {
  load: () => Promise<void>;
  update: (partial: Partial<Settings>) => Promise<void>;
  clearAll: () => Promise<void>;
};

const DEFAULTS: Settings = {
  displayName: "",
  apiKey: "",
  questionsPerTest: 5,
  defaultSource: "syllabus",
  theme: "dark",
  loaded: false,
};

export const useSettings = create<Settings & Actions>((set, get) => ({
  ...DEFAULTS,
  load: async () => {
    try {
      const data = await AsyncStorage.getItem("@paktest/settings");
      const api = await AsyncStorage.getItem("gemini_api_key");
      const parsed = data ? JSON.parse(data) : {};
      set({ ...DEFAULTS, ...parsed, apiKey: api ?? "", loaded: true });
    } catch {
      set({ ...DEFAULTS, loaded: true });
    }
  },
  update: async (partial) => {
    const current = get();
    const next = { ...current, ...partial, loaded: true };
    await AsyncStorage.setItem("@paktest/settings", JSON.stringify({
      displayName: next.displayName,
      questionsPerTest: next.questionsPerTest,
      defaultSource: next.defaultSource,
      theme: next.theme,
    }));
    if (partial.apiKey !== undefined) {
      await AsyncStorage.setItem("gemini_api_key", partial.apiKey);
    }
    set(next);
  },
  clearAll: async () => {
    await AsyncStorage.clear();
    set({ ...DEFAULTS, loaded: true });
  },
}));