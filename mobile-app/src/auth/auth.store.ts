import { create } from "zustand";
import { tokenStorage } from "./token.storage";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;

  setTokens: (access: string, refresh?: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  isHydrated: false,

  setTokens: async (access, refresh) => {
    await tokenStorage.setAccess(access);
    if (refresh) await tokenStorage.setRefresh(refresh);

    set({
      accessToken: access,
      refreshToken: refresh ?? get().refreshToken,
    });
  },

  logout: async () => {
    await tokenStorage.clear();
    set({ accessToken: null, refreshToken: null });
  },

  hydrate: async () => {
    const [access, refresh] = await Promise.all([
      tokenStorage.getAccess(),
      tokenStorage.getRefresh(),
    ]);
    set({ accessToken: access, refreshToken: refresh, isHydrated: true });
  },
}));
