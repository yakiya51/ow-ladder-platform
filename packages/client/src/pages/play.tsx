import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useMatchQueueContext } from "@/features/matchqueue-context";
import { OW_ROLES, OwRole } from "@ow/core";
import { cn } from "@/lib/css";

export function PlayPage() {
  return <QueueView />;
}

function QueueView() {
  const { queueState, joinQueue, leaveQueue } = useMatchQueueContext();

  const handleRoleSelect = (role: OwRole) => {
    setSelectedRoles({ ...selectedRoles, [role]: !selectedRoles[role] });
  };

  const handleJoinQueue = () => {
    joinQueue(selectedRolesArray);
    setSelectedRoles({ DAMAGE: false, SUPPORT: false, TANK: false });
  };

  const [selectedRoles, setSelectedRoles] = useState<Record<OwRole, boolean>>({
    DAMAGE: false,
    SUPPORT: false,
    TANK: false,
  });

  const selectedRolesArray = useMemo(() => {
    return OW_ROLES.map((role) => (selectedRoles[role] ? role : null)).filter(
      (role) => role !== null,
    );
  }, [selectedRoles]);

  return (
    <>
      <div className="flex gap-x-2 items-center">
        {OW_ROLES.map((role) => (
          <div
            key={role}
            className={cn(
              "w-full border",
              selectedRoles[role] && "bg-blue-600/50",
            )}
            onClick={() => handleRoleSelect(role)}
          >
            <div className="flex justify-center">
              <label htmlFor={role}>{role}</label>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={handleJoinQueue}
        disabled={
          selectedRolesArray.length === 0 || queueState.state === "IN_QUEUE"
        }
      >
        Join Queue
      </Button>
      {queueState.state === "IN_QUEUE" && (
        <Button onClick={leaveQueue}>Leave Queue</Button>
      )}
    </>
  );
}
