import { useWebSocket, UseWebSocketReturn } from "@/lib/ws-client";
import {
  MatchState,
  MatchSetupState,
  QueueState,
  ServerToClientMsg,
  OwRole,
} from "@ow/shared";
import {
  createContext,
  ReactNode,
  useReducer,
  useContext,
  ActionDispatch,
} from "react";

type MatchMakingState = QueueState | MatchSetupState | MatchState;

function reduce(
  currentState: MatchMakingState,
  msg: ServerToClientMsg,
): MatchMakingState {
  const transition = stateTransitions[currentState.status][msg.kind] as
    | ((
        state: MatchMakingState,
        message: ServerToClientMsg,
      ) => MatchMakingState)
    | undefined;

  return transition ? transition(currentState, msg) : currentState;
}

const stateTransitions: {
  [S in MatchMakingState["status"]]: Partial<{
    [Message in ServerToClientMsg["kind"]]: (
      state: Extract<MatchMakingState, { status: S }>,
      msg: Extract<ServerToClientMsg, { kind: Message }>,
    ) => MatchMakingState;
  }>;
} = {
  NOT_IN_QUEUE: {
    QUEUE_JOINED: (_, { payload }) => {
      return { status: "IN_QUEUE", ...payload };
    },
  },
  IN_QUEUE: {
    QUEUE_LEFT: () => {
      return { status: "NOT_IN_QUEUE" };
    },
    MATCH_FOUND: (_state, { payload }) => {
      return { status: "MATCH_FOUND", ...payload };
    },
    QUEUE_UPDATED: (_, { payload }) => {
      return { status: "IN_QUEUE", ...payload };
    },
    MATCH_CANCELLED: () => {
      return { status: "NOT_IN_QUEUE" };
    },
  },
  MATCH_FOUND: {
    DRAFT_STARTED: (_state, { payload }) => {
      return {
        status: "DRAFT",
        id: payload.matchId,
        teams: payload.teams,
        draftablePlayers: payload.draftablePlayers,
      };
    },
    MATCH_CANCELLED: () => {
      return { status: "NOT_IN_QUEUE" };
    },
  },
  DRAFT: {
    DRAFT_UPDATED: (state, { payload }) => {
      return {
        status: "DRAFT",
        id: state.id,
        ...payload,
      };
    },
    DRAFT_COMPLETED: (state, { payload }) => {
      return {
        status: "MAP_VOTE",
        id: state.id,
        teams: payload.teams,
      };
    },
  },
  MAP_VOTE: {
    MAP_VOTE_COMPLETED: (state, { payload }) => {
      return {
        status: "IN_PROGRESS",
        id: state.id,
        teams: state.teams,
        map: payload.map,
      };
    },
  },
  IN_PROGRESS: {},
  FINISHED: {},
};

type MatchMakingContextValue = {
  state: MatchMakingState;
  ws: UseWebSocketReturn;
  joinQueue: (role: Array<OwRole>) => void;
  leaveQueue: () => void;
  dispatch: ActionDispatch<[msg: ServerToClientMsg]>;
};

const MatchMakingContext = createContext<MatchMakingContextValue | null>(null);

export function MatchMakingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reduce, { status: "NOT_IN_QUEUE" });

  const ws = useWebSocket({
    onMessage: (message) => {
      if (message.kind === "ERROR") {
        console.error(message);
        return;
      }
      dispatch(message);
    },
    onConnect: () => console.log("CONNECTED"),
    onDisconnect: () => console.log("DISCONNECTED"),
  });

  const joinQueue = (roles: Array<OwRole>) => {
    ws.connect(() => ws.send({ kind: "QUEUE_JOIN", payload: { roles } }));
  };

  const leaveQueue = () => {
    ws.send({ kind: "QUEUE_LEAVE" });
  };

  return (
    <MatchMakingContext.Provider
      value={{
        state,
        ws,
        dispatch,
        joinQueue,
        leaveQueue,
      }}
    >
      {children}
    </MatchMakingContext.Provider>
  );
}

export function useMatchMakingContext() {
  const context = useContext(MatchMakingContext);

  if (!context) {
    throw new Error(
      "useMatchMakingContext must be used within MatchMakingProvider",
    );
  }

  return context;
}
