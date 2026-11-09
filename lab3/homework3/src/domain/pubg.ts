export type DropPhase =
  | 'WARMUP'
  | 'AIRDROP_LIVE'
  | 'LOOTED_OUT'
  | 'EXPIRED'

export interface PubgCrateDrop {
  readonly id: string
  readonly title: string
  readonly priceVnd: number
  readonly remainingStock: number
  readonly dropEpochMs: number
}

export interface PubgVnSquadStanding {
  readonly squadId: string
  readonly squadName: string
  readonly wwcdCount: number
  readonly placementPts: number
  readonly killPts: number
}

export interface PubgKillEvent {
  readonly id: string
  readonly occurredAt: number
  readonly killerName: string
  readonly victimName: string
  readonly killerSquadId: string
  readonly victimSquadId: string
}
