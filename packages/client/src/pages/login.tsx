import { Button } from "@/components/ui/button";
import { rpc } from "@/lib/rpc-client";
import { useMutation } from "@tanstack/react-query";

export function LoginPage() {
  const { mutateAsync: login } = useMutation(
    rpc.auth.getBNetAuthorizationURL.mutationOptions(),
  );

  const handleLogin = async () => {
    const url = await login({});
    window.location.assign(url);
  };

  return (
    <main className="flex justify-center p-12">
      <Button onClick={handleLogin}>Continue with Battle.net</Button>
    </main>
  );
}
