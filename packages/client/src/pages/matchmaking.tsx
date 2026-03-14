import { Button } from "@/components/ui/button";
import { ReactNode, useState } from "react";
import { useMatchMakingContext } from "@/features/matchmaking";
import { OW_ROLES, OwRole } from "@ow/shared";
import { Checkbox } from "@/components/ui/checkbox";

export function MatchMakingPage() {
  const { state, ws } = useMatchMakingContext();

  let phase: ReactNode = <LadderQueue />;

  if (state.status === "DRAFT" || state.status === "MAP_VOTE") {
    phase = <MatchSetup />;
  }

  if (state.status === "IN_PROGRESS" || state.status === "FINISHED") {
    phase = <LiveMatch />;
  }

  return (
    <main>
      <p>Web Socket Status: {ws.status}</p>
      <p>State: {state.status}</p>
      <div className="py-4">{phase}</div>
    </main>
  );
}

function LadderQueue() {
  const [selectedRoles, setSelectedRoles] = useState<Array<OwRole>>([]);
  const { ws, state, joinQueue, leaveQueue } = useMatchMakingContext();

  const handleRoleSelect = (role: OwRole) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  return (
    <>
      {OW_ROLES.map((role) => (
        <div className="flex gap-x-2 items-center">
          <Checkbox id={role} onCheckedChange={() => handleRoleSelect(role)} />
          <label htmlFor={role}>{role}</label>
        </div>
      ))}

      <Button
        onClick={() => joinQueue(selectedRoles)}
        disabled={
          selectedRoles.length === 0 ||
          ws.status === "connected" ||
          ws.status === "connecting"
        }
      >
        Join Queue
      </Button>
      <Button disabled={ws.status === "disconnected"} onClick={leaveQueue}>
        Leave Queue
      </Button>
    </>
  );
}

function MatchSetup() {
  const { state, ws } = useMatchMakingContext();

  return (
    <>
      <p>Match setup: {state.status}</p>
    </>
  );
}

function LiveMatch() {
  const { state, ws } = useMatchMakingContext();

  return (
    <>
      <p>Match phase: {state.status}</p>
    </>
  );
}
