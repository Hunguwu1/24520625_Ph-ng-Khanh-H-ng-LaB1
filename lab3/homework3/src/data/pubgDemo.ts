import type {
  PubgCrateDrop,
  PubgVnSquadStanding,
} from '../domain/pubg'

// Giá, tồn kho và điểm số dưới đây chỉ phục vụ mô phỏng bài tập.
export function createDemoDrops(now = Date.now()): PubgCrateDrop[] {
  return [
    {
      id: 'pvs-vip-ticket',
      title: 'PVS Finals VIP Pass',
      priceVnd: 500_000,
      remainingStock: 10,
      dropEpochMs: now + 30_000,
    },
    {
      id: 'gcoin-crate',
      title: '5.000 G-Coin Contraband Crate',
      priceVnd: 200_000,
      remainingStock: 20,
      dropEpochMs: now + 60_000,
    },
  ]
}

// Persist the demo schedule, not a ticking countdown. Reloads must not postpone it.
export function loadDemoDrops(): PubgCrateDrop[] {
  const key = 'pubg-arena-demo-start-v1'
  const now = Date.now()
  try {
    const saved = localStorage.getItem(key)
    const startsAt = saved === null ? now : Number(saved)
    if (Number.isSafeInteger(startsAt) && startsAt > 0 && startsAt <= now) {
      if (saved === null) localStorage.setItem(key, String(startsAt))
      return createDemoDrops(startsAt)
    }
    localStorage.setItem(key, String(now))
  } catch {
    // Storage may be unavailable; the in-memory demo must still render.
  }
  return createDemoDrops(now)
}

export const demoStandings: PubgVnSquadStanding[] = [
  {
    squadId: 'te',
    squadName: 'The Expendables',
    wwcdCount: 3,
    placementPts: 45,
    killPts: 62,
  },
  {
    squadId: 'ces',
    squadName: 'Cerberus Esports',
    wwcdCount: 2,
    placementPts: 40,
    killPts: 58,
  },
  {
    squadId: 'roy',
    squadName: 'Roy Esports',
    wwcdCount: 1,
    placementPts: 32,
    killPts: 49,
  },
  {
    squadId: 'agg',
    squadName: 'AGG',
    wwcdCount: 1,
    placementPts: 28,
    killPts: 44,
  },
]
