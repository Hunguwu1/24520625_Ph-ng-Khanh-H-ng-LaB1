import assert from 'node:assert/strict'
import { test } from 'node:test'
import { expireReservations } from './expiration.ts'
import { reserveInventory } from './reservations.ts'
import { db, getInventory, product } from './store.ts'

test('expiration respects deadline, releases once and rolls back', () => {
    try {
        const first = reserveInventory({
            productId: product.id,
            userId: 'user-001',
            quantity: 2,
            expectedVersion: 0,
        })

        const second = reserveInventory({
            productId: product.id,
            userId: 'user-002',
            quantity: 3,
            expectedVersion: 1,
        })

        // Cho lượt đầu hết hạn sớm hơn lượt thứ hai.
        const cutoff = Math.min(first.expiresAt, second.expiresAt) - 1000

        db.prepare(
            'UPDATE reservations SET expiresAt = ? WHERE id = ?',
        ).run(cutoff, first.id)

        const before = getInventory()

        assert.equal(expireReservations(cutoff - 1), 0)
        assert.deepEqual(getInventory(), before)

        assert.equal(expireReservations(cutoff), 1)
        assert.equal(getInventory().available, 7)
        assert.equal(getInventory().reserved, 3)
        assert.equal(getInventory().version, 3)

        const readStatus = (id: string) => db.prepare(
            'SELECT status FROM reservations WHERE id = ?',
        ).get(id)?.status

        assert.equal(readStatus(first.id), 'EXPIRED')
        assert.equal(readStatus(second.id), 'ACTIVE')

        const afterFirst = getInventory()

        assert.equal(expireReservations(cutoff), 0)
        assert.deepEqual(getInventory(), afterFirst)

        // Gây lỗi cập nhật kho để kiểm tra rollback cả trạng thái.
        db.exec(`
            CREATE TRIGGER fail_inventory_release
            BEFORE UPDATE ON inventory
            BEGIN
                SELECT RAISE(ABORT, 'TEST_RELEASE_FAILURE');
            END;
        `)

        assert.throws(
            () => expireReservations(second.expiresAt),
            /TEST_RELEASE_FAILURE/,
        )

        assert.equal(readStatus(second.id), 'ACTIVE')
        assert.deepEqual(getInventory(), afterFirst)

        db.exec('DROP TRIGGER fail_inventory_release')

        assert.equal(expireReservations(second.expiresAt), 1)
        assert.equal(getInventory().available, 10)
        assert.equal(getInventory().reserved, 0)
        assert.equal(getInventory().sold, 0)
        assert.equal(getInventory().version, 4)

        assert.equal(expireReservations(second.expiresAt), 0)
    } finally {
        db.close()
    }
})
