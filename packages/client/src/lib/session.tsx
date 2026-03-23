import { useQuery } from "@tanstack/react-query";
import { createContext, PropsWithChildren, useContext, useEffect } from "react";
import { useLocation } from "wouter";
import { rpc } from "@/lib/rpc-client";

export type Session = {
  userId: string;
  sessionId: string;
  battleTag: string;
};

type SessionContextValue =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; session: Session };

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const query = useQuery(
    rpc.auth.getCurrentSession.queryOptions({
      retry: false,
      refetchOnWindowFocus: false,
    }),
  );

  const { data: session, isLoading, error } = query;
  const hasSession = session !== null && session !== undefined;

  const value: SessionContextValue = isLoading
    ? { status: "loading" }
    : hasSession
      ? { session, status: "authenticated" }
      : { status: "unauthenticated" };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSessionState(): SessionContextValue {
  const context = useContext(SessionContext);

  if (context === null) {
    throw new Error("useSessionState must be used within a SessionProvider");
  }

  return context;
}

export function useSession(): Session {
  const state = useSessionState();

  if (state.status !== "authenticated" || state.session === null) {
    throw new Error("useSession must be used within an authenticated session");
  }

  return state.session;
}

export function ProtectedLayout({ children }: PropsWithChildren) {
  const [, setLocation] = useLocation();
  const state = useSessionState();

  useEffect(() => {
    if (state.status === "unauthenticated") {
      setLocation("/login");
    }
  }, [state.status, setLocation]);

  if (state.status !== "authenticated") {
    return "Loading...";
  }

  return children;
}
