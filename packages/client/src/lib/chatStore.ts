import { create } from "zustand";
import { edenApi } from "./useEden";

export type Message = {
  name: string;
  message: string;
};

export type ChatStore = {
  // maybe move the Message type to ./shared ?
  messages: Message[];
  status: "CONNECTED" | "DISCONNECTED";

  // actions
  sendMessage: (message: string) => void;
  clearMessages: () => void;

  connect: (token: string) => void;
  disconnect: () => void;
  isConnected: () => boolean;
};

export const useChatStore = create<ChatStore>((set, get) => {
  const { api } = edenApi();
  type ChatWS = ReturnType<(typeof api)["chat"]["ws"]["subscribe"]>;
  let ws: ChatWS | null = null;
  let authToken: string = "";

  function onMessage(data: Message) {
    if (data.name === "x") {
      if (data.message === "AUTHENTICATED") {
        set({ status: "CONNECTED" });
        return;
      }

      if (data.message === "NOT_AUTHENTICATED") {
        ws?.send({ accessToken: authToken || "" });
      }

      return;
    }

    set((state) => ({ messages: [...state.messages, data] }));
  }

  return {
    messages: [],
    status: "DISCONNECTED",

    // actions
    sendMessage: (msg) => {
      ws?.send({ message: msg });
    },
    clearMessages: () => set({ messages: [] }),

    connect: (token) => {
      if (ws) get().disconnect();

      authToken = token;
      ws = api.chat.ws.subscribe();

      ws.on("message", ({ data }) => onMessage(data));
    },

    disconnect: () => {
      ws?.close();
      ws = null;
      set({ status: "DISCONNECTED" });
    },

    isConnected: () => get().status === "CONNECTED",
  };
});
