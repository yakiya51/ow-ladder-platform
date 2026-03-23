import { PropsWithChildren } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { rpc } from "./lib/rpc-client";
import { queryClient } from "./lib/query-client";
import { Button } from "./components/ui/button";

export function AppLayout({ children }: PropsWithChildren) {
  const [_, setLocation] = useLocation();
  // const session = useSession();

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
      <nav className="flex justify-between p-4 items-center border-b container max-w-6xl mx-auto">
        <div className="mr-auto flex gap-x-8 font-medium text-sm">
          <Link href="/">
            <h1 className="font-semibold">Rat Race</h1>
          </Link>
          <div className="flex gap-x-4">
            <Link href="/play">Play</Link>
          </div>
        </div>
        <Button variant="ghost">Yuta#1234</Button>
      </nav>
      <div className="container mx-auto max-w-6xl px-4 py-10">{children}</div>
    </>
  );
}
