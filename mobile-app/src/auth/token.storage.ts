import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export const tokenStorage = {
  getAccess: () => SecureStore.getItemAsync(ACCESS_KEY),
  setAccess: (v: string) => SecureStore.setItemAsync(ACCESS_KEY, v),
  removeAccess: () => SecureStore.deleteItemAsync(ACCESS_KEY),

  getRefresh: () => SecureStore.getItemAsync(REFRESH_KEY),
  setRefresh: (v: string) => SecureStore.setItemAsync(REFRESH_KEY, v),
  removeRefresh: () => SecureStore.deleteItemAsync(REFRESH_KEY),

  clear: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
    ]);
  },
};
