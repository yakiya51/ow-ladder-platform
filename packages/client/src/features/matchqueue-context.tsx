import { OwRole } from "@ow/core";
import { QueueState } from "@ow/core/src/types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useWs } from "./ws-context";

const MatchQueueContext = createContext({
  queueState: { state: "NOT_IN_QUEUE" } as QueueState,
  acceptMatch: () => {},
  declineMatch: () => {},
  joinQueue: ((roles: Array<OwRole>) => {}) as (
    roles: Array<OwRole>,
  ) => Promise<void>,
  leaveQueue: () => {},
});

export function MatchQueueProvider({ children }: { children: ReactNode }) {
  const { connect, disconnect, send, status, subscribe } = useWs();
  const [queueState, setQueueState] = useState<QueueState>({
    state: "NOT_IN_QUEUE",
  });

  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      console.log({ message });
      switch (message.kind) {
        case "QUEUE_JOINED":
          setQueueState({
            state: "IN_QUEUE",
            playerCount: message.queuedPlayersCount,
          });
          break;
        case "QUEUE_UPDATED":
          setQueueState((prev) =>
            prev.state === "IN_QUEUE"
              ? { state: "IN_QUEUE", playerCount: message.queuedPlayersCount }
              : prev,
          );
          break;
        case "QUEUE_LEFT":
          setQueueState({ state: "NOT_IN_QUEUE" });
          break;
      }
    });

    return unsubscribe;
  }, [subscribe]);

  const joinQueue = async (roles: Array<OwRole>) => {
    if (status !== "connected") {
      await connect();
    }
    send({ kind: "QUEUE_JOIN", roles });
  };

  const leaveQueue = () => {
    send({ kind: "QUEUE_LEAVE" });
    setQueueState({ state: "NOT_IN_QUEUE" });
    disconnect();
  };

  const acceptMatch = () => {
    send({ kind: "MATCH_ACCEPT" });
  };

  const declineMatch = () => {
    send({ kind: "MATCH_DECLINE" });
  };

  return (
    <MatchQueueContext.Provider
      value={{
        queueState,
        joinQueue,
        leaveQueue,
        acceptMatch,
        declineMatch,
      }}
    >
      {children}
    </MatchQueueContext.Provider>
  );
}

export function useMatchQueueContext() {
  const context = useContext(MatchQueueContext);

  if (!context) {
    throw new Error(
      "useMatchQueueContext must be used within MatchQueueProvider",
    );
  }

  return context;
}
