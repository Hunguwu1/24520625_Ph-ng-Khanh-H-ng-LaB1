import type { FlashSale, Inventory, Product } from '../domain/models'

export interface ProductResponse {
    product: Product
    inventory: Inventory
    flashSale: FlashSale
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
        throw new Error(`Không tải được sản phẩm: HTTP ${response.status}`)
    }

    const data: ProductResponse = await response.json()
    const serverOffsetMs = data.serverNow - (sentAt + receivedAt) / 2

    return { ...data, serverOffsetMs }
}