import { PropsWithChildren } from "react";
import { useSession } from "./lib/session";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { rpc } from "./lib/rpc-client";
import { queryClient } from "./lib/query-client";
import { Button } from "./components/ui/button";

export function AppLayout({ children }: PropsWithChildren) {
  const [_, setLocation] = useLocation();
  const session = useSession();

  const logoutMutation = useMutation(rpc.auth.logout.mutationOptions());

  const handleLogout = async () => {
    await logoutMutation.mutateAsync({});
    queryClient.invalidateQueries({
      queryKey: rpc.auth.getCurrentSession.queryKey(),
    });
    setLocation("/login");
  };

  return (
    <>
      <nav className="flex justify-between p-4 items-center">
        <div className="mr-auto space-x-4 font-medium text-sm">
          <Link href="/home">Home</Link>
          <Link href="/matchmaking">Match Making</Link>
        </div>
        <p>{session.battleTag}</p>
        <Button variant={"destructive"} onClick={handleLogout}>
          Logout
        </Button>
      </nav>
      <div className="px-4">{children}</div>
    </>
  );
}
