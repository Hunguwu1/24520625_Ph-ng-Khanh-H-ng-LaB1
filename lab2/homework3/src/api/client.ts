import type {
  FlashSale,
  Inventory,
  Order,
  Product,
  Reservation,
} from '../domain/models'

export interface ProductResponse {
  product: Product
  inventory: Inventory
  flashSale: FlashSale
  serverNow: number
}

export interface ReservationResponse {
  reservation: Reservation
  inventory: Inventory
  serverNow: number
}

export interface CheckoutResponse {
  order: Order
  inventory: Inventory
  serverNow: number
}

export async function getProduct(
  productId: string,
): Promise<ProductResponse & { serverOffsetMs: number }> {
  const sentAt = Date.now()
  const response = await fetch(
    `/api/products/${encodeURIComponent(productId)}`,
    { cache: 'no-store' },
  )
  const receivedAt = Date.now()

  if (!response.ok) {
    throw new Error(`HTTP_${response.status}`)
  }

  const data: ProductResponse = await response.json()
  const serverOffsetMs = data.serverNow - (sentAt + receivedAt) / 2

  return { ...data, serverOffsetMs }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      typeof data?.error === 'string' ? data.error : 'REQUEST_FAILED',
    )
  }

  return data as T
}

export function reserveProduct(input: {
  productId: string
  userId: string
  quantity: number
  expectedVersion: number
}): Promise<ReservationResponse> {
  return postJson('/api/reservations', input)
}

export function confirmCheckout(
  reservationId: string,
  userId: string,
): Promise<CheckoutResponse> {
  return postJson('/api/checkout', { reservationId, userId })
}
