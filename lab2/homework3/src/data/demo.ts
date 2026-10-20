import type { Inventory, Product } from '../domain/models'

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