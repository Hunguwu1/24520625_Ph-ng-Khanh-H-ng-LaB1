import type { FlashSale, Inventory, Product } from '../domain/models'

export const product: Product = {
    id: 'product-001',
    name: 'Tai nghe Bluetooth',
    originalPrice: 599_000,
    salePrice: 299_000,
}

export const inventory: Inventory = {
    productId: product.id,
    total: 10,
    available: 10,
    reserved: 0,
    sold: 0,
    version: 0,
}

const saleDurationMs = 5 * 60 * 1000
const storageKey = 'flash-sale-demo-ends-at'

// Đọc lại hạn kết thúc nếu trang đã từng được mở.
let endsAt = Number(localStorage.getItem(storageKey))

// Chỉ tạo phiên mới khi chưa có mốc hợp lệ.
if (!Number.isFinite(endsAt) || endsAt <= 0) {
    endsAt = Date.now() + saleDurationMs
    localStorage.setItem(storageKey, String(endsAt))
}

export const flashSale: FlashSale = {
    id: 'sale-demo-001',
    productId: product.id,
    startsAt: endsAt - saleDurationMs,
    endsAt,
}