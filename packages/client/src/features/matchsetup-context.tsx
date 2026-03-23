import { Match, OwMap, OwRole } from "@ow/core";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type MatchSetupContextValue = {
  matchState: Match | null;
  draftPlayer: (playerId: string) => void;
  voteForMap: (map: OwMap) => void;
};

const MatchSetupContext = createContext<MatchSetupContextValue | null>(null);

export function MatchSetupProvider({ children }: { children: ReactNode }) {
  const [matchState, setMatchState] = useState<Match | null>(null);

  return (
    <MatchSetupContext.Provider
      value={{
        matchState,
      }}
    >
      {children}
    </MatchSetupContext.Provider>
  );
}

export function useMatchSetupContext() {
  const context = useContext(MatchSetupContext);

  if (!context) {
    throw new Error(
      "useMatchSetupContext must be used within MatchSetupProvider",
    );
  }

  return context;
}
