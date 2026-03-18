import { io, Socket } from "socket.io-client";
import { ClientToServerMessage, ServerToClientMessage } from "@ow/core";
import { useEffect, useRef, useState, useCallback } from "react";

type ConnectionStatus = "connected" | "disconnected" | "connecting";

const URL = `${location.protocol}//${import.meta.env.PUBLIC_SERVER_HOST}:${import.meta.env.PUBLIC_SERVER_PORT}`;

export interface UseWebSocketReturn {
  status: ConnectionStatus;
  connect: (onSuccess?: () => void) => void;
  disconnect: (onSuccess?: () => void) => void;
  send: (message: ClientToServerMessage) => void;
}

export function useWebSocket({
  onMessage,
  onConnect,
  onDisconnect,
}: {
  onMessage: (msg: ServerToClientMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}): UseWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const socketRef = useRef<Socket | null>(null);
  const cbRef = useRef({ onMessage, onConnect, onDisconnect });

  useEffect(() => {
    cbRef.current = { onMessage, onConnect, onDisconnect };
  }, [onMessage, onConnect, onDisconnect]);

  function getSocket(): Socket {
    if (socketRef.current) return socketRef.current;
    const socket = io(URL, { autoConnect: false, withCredentials: true });
    socket.on("connect", () => {
      setStatus("connected");
      cbRef.current.onConnect?.();
    });
    socket.on("disconnect", () => {
      setStatus("disconnected");
      cbRef.current.onDisconnect?.();
    });
    socket.onAny((kind: string, payload?: unknown) => {
      cbRef.current.onMessage(
        (payload !== undefined
          ? { kind, payload }
          : { kind }) as ServerToClientMessage,
      );
    });
    socketRef.current = socket;
    return socket;
  }

  const connect = useCallback((onSuccess?: () => void) => {
    const socket = getSocket();

    if (onSuccess) {
      socket.once("connect", onSuccess);
    }

    setStatus("connecting");
    socket.connect();
  }, []);

  const disconnect = useCallback((onSuccess?: () => void) => {
    socketRef.current?.disconnect();
    onSuccess?.();
    setStatus("disconnected");
  }, []);

  const send = useCallback((message: ClientToServerMessage) => {
    socketRef.current?.emit("message", message);
  }, []);

  // Disconnect when unmounted
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return { status, connect, disconnect, send };
}
