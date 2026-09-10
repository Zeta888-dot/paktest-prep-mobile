import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "@paktest/auth_token";
const USER_KEY = "@paktest/auth_user";

export type AuthUser = {
  email: string;
  name: string | null;
  image: string | null;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  loaded: boolean;
  signingIn: boolean;
};

type Actions = {
  load: () => Promise<void>;
  setSession: (token: string, user: AuthUser) => Promise<void>;
  setSigningIn: (value: boolean) => void;
  signOut: () => Promise<void>;
};

export const useAuth = create<AuthState & Actions>((set) => ({
  token: null,
  user: null,
  loaded: false,
  signingIn: false,

  load: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userRaw = await SecureStore.getItemAsync(USER_KEY);
      const user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null;
      set({ token, user, loaded: true });
    } catch {
      set({ token: null, user: null, loaded: true });
    }
  },

  setSession: async (token, user) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ token, user, loaded: true, signingIn: false });
  },

  setSigningIn: (value) => set({ signingIn: value }),

  signOut: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    set({ token: null, user: null });
  },
}));