import type { ReservationStatus } from './models'

const allowedTransitions: Record<
    ReservationStatus,
    readonly ReservationStatus[]
> = {
    ACTIVE: ['CONFIRMED', 'EXPIRED', 'CANCELLED'],
    CONFIRMED: [],
    EXPIRED: [],
    CANCELLED: [],
}

export function canTransition(
    currentStatus: ReservationStatus,
    nextStatus: ReservationStatus,
): boolean {
    return allowedTransitions[currentStatus].includes(nextStatus)
}