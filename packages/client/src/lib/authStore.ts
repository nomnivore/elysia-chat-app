import { create } from "zustand";
import { edenApi } from "./useEden";

export type AuthUser = {
  id: string;
  name: string;
};
export type AuthStore = {
  token: string | null;
  user: AuthUser | null;

  // actions
  isAuthed: () => boolean;

  // mutations
  login: (token: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set, get) => {
  const { api } = edenApi();

  return {
    token: null,
    user: null,

    isAuthed: () => !!get().token,

    // TODO: convert to async/await
    login: async (token) => {
      // fetch user info from api
      const { data: user } = await api.auth.me.get({
        $headers: { Authorization: `Bearer ${token}` },
      });

      set({ token, user });
    },
    logout: () => set({ token: null, user: null }),
  };
});
