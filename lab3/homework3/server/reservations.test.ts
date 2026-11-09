import assert from 'node:assert/strict'
import { test } from 'node:test'
import { db, getInventory, product } from './store.ts'
import { reserveInventory } from './reservations.ts'

test('reservation validates stock, version and rollback', () => {
    try {
        const input = {
            productId: product.id,
            userId: 'user-001',
            quantity: 2,
            expectedVersion: 0,
        }

        // Giữ 2 sản phẩm thành công.
        const reservation = reserveInventory(input)

        assert.equal(reservation.status, 'ACTIVE')
        assert.equal(reservation.quantity, 2)
        assert.equal(getInventory().available, 8)
        assert.equal(getInventory().reserved, 2)
        assert.equal(getInventory().version, 1)

        const before = getInventory()

        // Phiên bản 0 đã cũ, yêu cầu phải thất bại.
        assert.throws(
            () => reserveInventory(input),
            /VERSION_CONFLICT/,
        )

        // Chỉ còn 8, không được giữ 9.
        assert.throws(
            () => reserveInventory({
                ...input, quantity: 9, expectedVersion: 1,
            }),
            /OUT_OF_STOCK/,
        )

        // Không cho phép giữ 0 sản phẩm.
        assert.throws(
            () => reserveInventory({
                ...input, quantity: 0, expectedVersion: 1,
            }),
            /INVALID_INPUT/,
        )

        assert.deepEqual(getInventory(), before)

        // Cố tình làm thao tác ghi lượt giữ thất bại.
        db.exec(`
      CREATE TRIGGER fail_reservation_insert
      BEFORE INSERT ON reservations
      BEGIN
        SELECT RAISE(ABORT, 'TEST_INSERT_FAILURE');
      END;
    `)

        assert.throws(
            () => reserveInventory({
                ...input, quantity: 1, expectedVersion: 1,
            }),
            /TEST_INSERT_FAILURE/,
        )

        // Kho phải được khôi phục sau lỗi ghi dữ liệu.
        assert.deepEqual(getInventory(), before)

        const row = db.prepare(
            'SELECT COUNT(*) AS count FROM reservations',
        ).get()

        assert.equal(row?.count, 1)
    } finally {
        db.close()
    }
})