import { ClientToServerMessage, ServerToClientMessage } from "@ow/server";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ClientToServerEvents, ServerToClientEvents } from "@ow/server";
import { io, Socket } from "socket.io-client";

const URL = `${location.protocol}//${import.meta.env.PUBLIC_SERVER_HOST}:${import.meta.env.PUBLIC_SERVER_PORT}`;

const ws: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {
  autoConnect: false,
  withCredentials: true,
});

type WsConnectionStatus = "disconnected" | "connecting" | "connected";

type MessageHandler = (message: ServerToClientMessage) => void;

type WsContextValue = {
  status: WsConnectionStatus;
  connect: () => Promise<void>;
  disconnect: () => void;
  send: (message: ClientToServerMessage) => void;
  subscribe: (handler: MessageHandler) => () => void;
};

const WsContext = createContext<WsContextValue | null>(null);

export function WsProvider({ children }: { children: ReactNode }) {
  const connectPromiseRef = useRef<Promise<void>>(null);
  const [status, setStatus] = useState<WsConnectionStatus>(
    ws.connected ? "connected" : "disconnected",
  );

  useEffect(() => {
    const onConnect = () => setStatus("connected");
    const onDisconnect = () => setStatus("disconnected");
    const onConnectError = () => setStatus("disconnected");

    ws.on("connect", onConnect);
    ws.on("disconnect", onDisconnect);
    ws.on("connect_error", onConnectError);

    return () => {
      ws.off("connect", onConnect);
      ws.off("disconnect", onDisconnect);
      ws.off("connect_error", onConnectError);
    };
  }, []);

  // Returns a promsie that resolves when connection is completed.
  // Times out in a set number of seconds
  const connect = () => {
    if (ws.connected) return Promise.resolve();
    if (connectPromiseRef.current) return connectPromiseRef.current;

    connectPromiseRef.current = new Promise<void>((resolve, reject) => {
      const onConnect = () => {
        cleanup();
        connectPromiseRef.current = null;
        resolve();
      };

      const onError = (err: Error) => {
        cleanup();
        connectPromiseRef.current = null;
        reject(err);
      };

      const timer = setTimeout(() => {
        cleanup();
        connectPromiseRef.current = null;
        reject(new Error("Socket connect timeout"));
      }, 8000);

      const cleanup = () => {
        clearTimeout(timer);
        ws.off("connect", onConnect);
        ws.off("connect_error", onError);
      };

      ws.once("connect", onConnect);
      ws.once("connect_error", onError);
      ws.connect();
    });

    return connectPromiseRef.current;
  };

  const disconnect = useCallback(() => {
    ws.disconnect();
    setStatus("disconnected");
  }, []);

  const send = useCallback((message: ClientToServerMessage) => {
    ws.emit("message", message);
  }, []);

  const subscribe = useCallback((handler: MessageHandler) => {
    const listener = (message: ServerToClientMessage) => {
      handler(message);
    };

    ws.on("message", listener);

    return () => {
      ws.off("message", listener);
    };
  }, []);

  return (
    <WsContext.Provider
      value={{
        status,
        connect,
        disconnect,
        send,
        subscribe,
      }}
    >
      {children}
    </WsContext.Provider>
  );
}

export function useWs(): WsContextValue {
  const context = useContext(WsContext);

  if (!context) {
    throw new Error("useWs must be used within WsProvider");
  }

  return context;
}
