import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkoutReservation } from './checkout.ts'
import { expireReservations } from './expiration.ts'
import { reserveInventory } from './reservations.ts'
import { db, getInventory, product } from './store.ts'

test('checkout is idempotent, rejects expiry and rolls back', () => {
    try {
        const reserve = (userId: string, quantity: number) =>
            reserveInventory({
                productId: product.id,
                userId,
                quantity,
                expectedVersion: getInventory().version,
            })

        const readStatus = (id: string) => db.prepare(
            'SELECT status FROM reservations WHERE id = ?',
        ).get(id)?.status

        // Thanh toán ngay trước thời điểm hết hạn.
        const first = reserve('user-001', 2)
        const order = checkoutReservation(
            first.id, first.userId, first.expiresAt - 1,
        )

        assert.equal(readStatus(first.id), 'CONFIRMED')
        assert.equal(order.totalAmount, 2 * product.salePrice)
        assert.equal(getInventory().available, 8)
        assert.equal(getInventory().reserved, 0)
        assert.equal(getInventory().sold, 2)

        const confirmedStock = getInventory()

        // Gửi lại sau hạn vẫn nhận đúng đơn đã tạo.
        const replay = checkoutReservation(
            first.id, first.userId, first.expiresAt + 1000,
        )

        assert.deepEqual(replay, order)
        assert.deepEqual(getInventory(), confirmedStock)
        assert.equal(
            db.prepare('SELECT COUNT(*) AS count FROM orders').get()?.count, 1,
        )

        assert.throws(
            () => checkoutReservation(first.id, 'another-user'),
            /FORBIDDEN/,
        )

        assert.throws(
            () => checkoutReservation('missing-id', 'user-001'),
            /RESERVATION_NOT_FOUND/,
        )

        // Đến đúng hạn: không được thanh toán lần đầu.
        const second = reserve('user-002', 1)

        assert.throws(
            () => checkoutReservation(
                second.id, second.userId, second.expiresAt,
            ),
            /RESERVATION_EXPIRED/,
        )

        assert.equal(readStatus(second.id), 'EXPIRED')
        assert.equal(getInventory().available, 8)
        assert.equal(getInventory().reserved, 0)
        assert.equal(getInventory().sold, 2)

        // Gây lỗi ghi đơn để kiểm tra rollback.
        const third = reserve('user-003', 1)
        const beforeFailure = getInventory()

        db.exec(`
      CREATE TRIGGER fail_order_insert
      BEFORE INSERT ON orders
      BEGIN
        SELECT RAISE(ABORT, 'TEST_ORDER_FAILURE');
      END;
    `)

        assert.throws(
            () => checkoutReservation(
                third.id, third.userId, third.expiresAt - 1,
            ),
            /TEST_ORDER_FAILURE/,
        )

        assert.equal(readStatus(third.id), 'ACTIVE')
        assert.deepEqual(getInventory(), beforeFailure)

        db.exec('DROP TRIGGER fail_order_insert')
        checkoutReservation(third.id, third.userId)

        // Hàng đã bán không được trả lại khi quét hết hạn.
        const finalStock = getInventory()

        assert.equal(finalStock.available, 7)
        assert.equal(finalStock.reserved, 0)
        assert.equal(finalStock.sold, 3)
        assert.equal(expireReservations(third.expiresAt + 1000), 0)
        assert.deepEqual(getInventory(), finalStock)
    } finally {
        db.close()
    }
})