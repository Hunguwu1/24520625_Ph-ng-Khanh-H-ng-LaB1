import { useState } from "react";
import PubgMatchTelemetry from "./components/PubgMatchTelemetry";

export default function App() {
  const [squadId, setSquadId] = useState("te");

  return (
    <main>
      <h1>PUBG VN Live Match Radar</h1>

      <label htmlFor="squad">Chọn đội: </label>

      <select
        id="squad"
        value={squadId}
        onChange={(event) => setSquadId(event.target.value)}
      >
        <option value="te">The Expendables</option>
        <option value="ce">Cerberus Esports</option>
      </select>

      <PubgMatchTelemetry squadId={squadId} />
    </main>
  );
}