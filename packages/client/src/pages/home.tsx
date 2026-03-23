import { OwRole } from "@ow/core";
import { useState } from "react";

export function HomePage() {
  const [selectedRoles, setSelectedRoles] = useState<Array<OwRole>>([]);
  // const { ws, state, joinQueue, leaveQueue } = useMatchMakingContext();

  const handleRoleSelect = (role: OwRole) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  return (
    <main>
      <h2>Recent Matches</h2>
      <ul>
        <li>Team Carter vs. Team Rokit</li>
      </ul>
    </main>
  );
}
