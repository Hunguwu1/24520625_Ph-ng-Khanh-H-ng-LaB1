import { db } from './store.ts'

export function expireReservations(now = Date.now()): number {
    db.exec('BEGIN IMMEDIATE')

    try {
        const expired = db.prepare(`
      UPDATE reservations
      SET status = 'EXPIRED'
      WHERE status = 'ACTIVE' AND expiresAt <= ?
      RETURNING productId, quantity
    `).all(now)

        for (const row of expired) {
            const quantity = Number(row.quantity)

            const result = db.prepare(`
        UPDATE inventory
        SET available = available + ?,
            reserved = reserved - ?,
            version = version + 1
        WHERE productId = ? AND reserved >= ?
      `).run(quantity, quantity, String(row.productId), quantity)

            if (result.changes !== 1) {
                throw new Error('INVENTORY_INCONSISTENT')
            }
        }

        db.exec('COMMIT')
        return expired.length
    } catch (error) {
        db.exec('ROLLBACK')
        throw error
    }
}