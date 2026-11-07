import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createApiServer } from './app.ts'
import { db } from './store.ts'
import type { Inventory, Order, Reservation } from '../src/domain/models.ts'

interface ProductResponse {
  inventory: Inventory
}

interface HoldResponse {
  reservation: Reservation
  inventory: Inventory
  error?: string
}

interface CheckoutResponse {
  order: Order
  inventory: Inventory
}

test('100 buyers cannot oversell; duplicate checkout creates one order', {
  timeout: 25_000,
}, async (t) => {
  const server = createApiServer()

  t.after(async () => {
    try {
      if (server.listening) {
        server.closeAllConnections()
        await new Promise<void>((resolve, reject) => {
          server.close((error) => error ? reject(error) : resolve())
        })
      }
    } finally {
      db.close()
    }
  })

  // Cổng 0: hệ điều hành cấp cổng trống, không dùng API demo ở cổng 3000.
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject)
      resolve()
    })
  })

  const address = server.address()
  assert.ok(address && typeof address !== 'string')
  const baseUrl = `http://127.0.0.1:${address.port}`

  async function request<T>(path: string, body?: unknown) {
    const response = await fetch(`${baseUrl}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    })
    return { status: response.status, data: await response.json() as T }
  }

  function assertInventory(inventory: Inventory): void {
    assert.ok(inventory.available >= 0)
    assert.ok(inventory.reserved >= 0)
    assert.ok(inventory.sold >= 0)
    assert.equal(
      inventory.available + inventory.reserved + inventory.sold,
      inventory.total,
    )
  }

  async function readStock(): Promise<Inventory> {
    const result = await request<ProductResponse>('/api/products/product-001')
    assert.equal(result.status, 200)
    assertInventory(result.data.inventory)
    return result.data.inventory
  }

  function hold(userId: string, expectedVersion: number) {
    return request<HoldResponse>('/api/reservations', {
      productId: 'product-001', userId, quantity: 1, expectedVersion,
    })
  }

  const initial = await readStock()
  assert.equal(initial.available, 10)
  assert.equal(initial.reserved, 0)
  assert.equal(initial.sold, 0)
  const buyers = Array.from({ length: 100 }, (_, i) => `buyer-${i}`)

  // Cùng version: chỉ một yêu cầu được cập nhật kho thành công.
  const firstWave = await Promise.all(
    buyers.map((userId) => hold(userId, initial.version)),
  )
  const reservations: Reservation[] = []
  const retryBuyers: string[] = []

  for (const [index, result] of firstWave.entries()) {
    if (result.status === 201) {
      assertInventory(result.data.inventory)
      reservations.push(result.data.reservation)
    } else {
      assert.equal(result.status, 409)
      assert.equal(result.data.error, 'VERSION_CONFLICT')
      retryBuyers.push(buyers[index]!)
    }
  }
  assert.equal(reservations.length, 1)
  assert.equal(retryBuyers.length, 99)

  // Chỉ thử lại lỗi xung đột version, luôn đọc version mới trước khi gửi.
  async function buyWithRetry(userId: string): Promise<Reservation | undefined> {
    for (let attempt = 0; attempt < 20; attempt++) {
      const stock = await readStock()
      if (stock.available === 0) return undefined

      const result = await hold(userId, stock.version)
      if (result.status === 201) {
        assertInventory(result.data.inventory)
        return result.data.reservation
      }

      assert.equal(result.status, 409)
      if (result.data.error === 'OUT_OF_STOCK') return undefined
      assert.equal(result.data.error, 'VERSION_CONFLICT')
    }
    throw new Error(`Vượt giới hạn thử lại: ${userId}`)
  }

  const retried = await Promise.all(retryBuyers.map(buyWithRetry))
  for (const reservation of retried) {
    if (reservation) reservations.push(reservation)
  }

  assert.equal(reservations.length, 10)
  assert.equal(retried.filter((value) => value === undefined).length, 90)
  assert.equal(new Set(reservations.map((value) => value.id)).size, 10)
  const heldStock = await readStock()
  assert.equal(heldStock.available, 0)
  assert.equal(heldStock.reserved, 10)
  assert.equal(heldStock.sold, 0)

  const rejected = await hold('extra-buyer', heldStock.version)
  assert.equal(rejected.status, 409)
  assert.equal(rejected.data.error, 'OUT_OF_STOCK')

  // Mỗi lượt giữ gửi hai POST thanh toán đồng thời, vẫn chỉ có một đơn.
  const orders = await Promise.all(reservations.map(async (reservation) => {
    const pay = () => request<CheckoutResponse>('/api/checkout', {
      reservationId: reservation.id, userId: reservation.userId,
    })
    const [first, repeated] = await Promise.all([pay(), pay()])
    assert.equal(first.status, 200)
    assert.equal(repeated.status, 200)
    assert.deepEqual(first.data.order, repeated.data.order)
    assert.equal(first.data.order.totalAmount, 299_000)
    assertInventory(first.data.inventory)
    assertInventory(repeated.data.inventory)
    return first.data.order
  }))

  const final = await readStock()
  assert.equal(final.available, 0)
  assert.equal(final.reserved, 0)
  assert.equal(final.sold, 10)
  assert.equal(new Set(orders.map((order) => order.id)).size, 10)
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM orders').get()?.count, 10)
  assert.equal(db.prepare(
    "SELECT COUNT(*) AS count FROM reservations WHERE status = 'CONFIRMED'",
  ).get()?.count, 10)
})
