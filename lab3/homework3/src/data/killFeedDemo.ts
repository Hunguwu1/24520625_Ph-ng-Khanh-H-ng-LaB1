import type { PubgKillEvent } from '../domain/pubg'
import { demoStandings } from './pubgDemo'

// Sự kiện giả lập, sắp từ mới nhất đến cũ nhất.
export function createDemoKillFeed(
  count = 30,
  now = Date.now(),
): PubgKillEvent[] {
  return Array.from({ length: count }, (_, index) => {
    const killer = demoStandings[index % demoStandings.length]
    const victim = demoStandings[(index + 1) % demoStandings.length]

    return {
      id: `kill-${index}`,
      occurredAt: now - index * 5000,
      killerName: `${killer.squadId.toUpperCase()}_Player1`,
      victimName: `${victim.squadId.toUpperCase()}_Player2`,
      killerSquadId: killer.squadId,
      victimSquadId: victim.squadId,
    }
  })
}
