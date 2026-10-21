import { randomUUID } from 'node:crypto'
import type { Reservation } from '../src/domain/models.ts'
import { db, flashSale, getInventory, product } from './store.ts'
import { expireReservations } from './expiration.ts'

interface ReserveInput {
    productId: string
    userId: string
    quantity: number
    expectedVersion: number
}

export function reserveInventory(input: ReserveInput): Reservation {
    const { productId, userId, quantity, expectedVersion } = input

    if (
        typeof userId !== 'string' || !userId.trim() ||
        !Number.isSafeInteger(quantity) || quantity <= 0 ||
        !Number.isSafeInteger(expectedVersion) || expectedVersion < 0
    ) {
        throw new Error('INVALID_INPUT')
    }

    if (productId !== product.id) {
        throw new Error('PRODUCT_NOT_FOUND')
    }

    // Thu hồi các lượt giữ đã hết hạn trước khi xử lý yêu cầu mới.
    expireReservations()

    db.exec('BEGIN IMMEDIATE')

    try {
        const now = Date.now()

        if (now < flashSale.startsAt || now >= flashSale.endsAt) {
            throw new Error('SALE_INACTIVE')
        }

        const result = db.prepare(`
      UPDATE inventory
      SET available = available - ?,
          reserved = reserved + ?,
          version = version + 1
      WHERE productId = ?
        AND version = ?
        AND available >= ?
    `).run(quantity, quantity, productId, expectedVersion, quantity)

        if (result.changes !== 1) {
            throw new Error(
                getInventory().available < quantity
                    ? 'OUT_OF_STOCK'
                    : 'VERSION_CONFLICT',
            )
        }

        const reservation: Reservation = {
            id: randomUUID(),
            productId,
            userId: userId.trim(),
            quantity,
            status: 'ACTIVE',
            expiresAt: Math.min(now + 30_000, flashSale.endsAt),
        }

        db.prepare(`
      INSERT INTO reservations
        (id, productId, userId, quantity, status, expiresAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
            reservation.id,
            reservation.productId,
            reservation.userId,
            reservation.quantity,
            reservation.status,
            reservation.expiresAt,
        )

        db.exec('COMMIT')
        return reservation
    } catch (error) {
        db.exec('ROLLBACK')
        throw error
    }
}
