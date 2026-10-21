import { randomUUID } from 'node:crypto'
import type { Order } from '../src/domain/models.ts'
import { expireReservations } from './expiration.ts'
import { db, product } from './store.ts'

export function checkoutReservation(
    reservationId: string,
    userId: string,
    now?: number,
): Order {
    if (
        typeof reservationId !== 'string' || !reservationId.trim() ||
        typeof userId !== 'string' || !userId.trim() ||
        (now !== undefined && (!Number.isSafeInteger(now) || now < 0))
    ) {
        throw new Error('INVALID_INPUT')
    }

    const ownerId = userId.trim()

    expireReservations(now ?? Date.now())
    db.exec('BEGIN IMMEDIATE')

    try {
        const currentTime = now ?? Date.now()

        const reservation = db.prepare(
            'SELECT * FROM reservations WHERE id = ?',
        ).get(reservationId)

        if (!reservation) {
            throw new Error('RESERVATION_NOT_FOUND')
        }

        if (reservation.userId !== ownerId) {
            throw new Error('FORBIDDEN')
        }

        const existing = db.prepare(
            'SELECT * FROM orders WHERE reservationId = ?',
        ).get(reservationId)

        // Đã mua thành công: trả lại đơn cũ.
        if (existing) {
            if (reservation.status !== 'CONFIRMED') {
                throw new Error('RESERVATION_INCONSISTENT')
            }

            const order: Order = {
                id: String(existing.id),
                reservationId: String(existing.reservationId),
                userId: String(existing.userId),
                quantity: Number(existing.quantity),
                totalAmount: Number(existing.totalAmount),
                createdAt: Number(existing.createdAt),
            }

            db.exec('COMMIT')
            return order
        }

        if (
            reservation.status === 'EXPIRED' ||
            (reservation.status === 'ACTIVE' &&
                Number(reservation.expiresAt) <= currentTime)
        ) {
            throw new Error('RESERVATION_EXPIRED')
        }

        if (reservation.status !== 'ACTIVE') {
            throw new Error('RESERVATION_NOT_ACTIVE')
        }

        if (reservation.productId !== product.id) {
            throw new Error('PRODUCT_NOT_FOUND')
        }

        const changed = db.prepare(`
      UPDATE reservations
      SET status = 'CONFIRMED'
      WHERE id = ? AND status = 'ACTIVE' AND expiresAt > ?
    `).run(reservationId, currentTime)

        if (changed.changes !== 1) {
            throw new Error('RESERVATION_NOT_ACTIVE')
        }

        const quantity = Number(reservation.quantity)

        const updated = db.prepare(`
      UPDATE inventory
      SET reserved = reserved - ?,
          sold = sold + ?,
          version = version + 1
      WHERE productId = ? AND reserved >= ?
    `).run(quantity, quantity, product.id, quantity)

        if (updated.changes !== 1) {
            throw new Error('INVENTORY_INCONSISTENT')
        }

        const order: Order = {
            id: randomUUID(),
            reservationId,
            userId: ownerId,
            quantity,
            totalAmount: quantity * product.salePrice,
            createdAt: currentTime,
        }

        db.prepare(`
      INSERT INTO orders
        (id, reservationId, userId, quantity, totalAmount, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
            order.id, order.reservationId, order.userId,
            order.quantity, order.totalAmount, order.createdAt,
        )

        db.exec('COMMIT')
        return order
    } catch (error) {
        db.exec('ROLLBACK')
        throw error
    }
}