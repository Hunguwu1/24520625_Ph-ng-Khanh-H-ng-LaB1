import type {
    FlashSale,
    Inventory,
    Product,
} from '../src/domain/models.ts'

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

const startsAt = Date.now()
const saleDurationMs = 5 * 60 * 1000

export const flashSale: FlashSale = {
    id: 'sale-server-001',
    productId: product.id,
    startsAt,
    endsAt: startsAt + saleDurationMs,
}