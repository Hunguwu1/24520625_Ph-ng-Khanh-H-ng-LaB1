import type { IncomingMessage } from 'node:http'

export async function readReservationInput(request: IncomingMessage) {
    const contentType = request.headers['content-type']
        ?.split(';')[0]?.trim().toLowerCase()

    if (contentType !== 'application/json') {
        request.resume()
        throw new Error('UNSUPPORTED_MEDIA_TYPE')
    }

    const chunks: Buffer[] = []
    const maxBytes = 16 * 1024
    let totalBytes = 0

    for await (const chunk of request) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
        totalBytes += buffer.length

        if (totalBytes <= maxBytes) {
            chunks.push(buffer)
        }
    }

    if (totalBytes > maxBytes) {
        throw new Error('PAYLOAD_TOO_LARGE')
    }

    let data: unknown

    try {
        data = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    } catch {
        throw new Error('INVALID_JSON')
    }

    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        throw new Error('INVALID_INPUT')
    }

    const value = data as Record<string, unknown>

    if (
        typeof value.productId !== 'string' ||
        typeof value.userId !== 'string' ||
        typeof value.quantity !== 'number' ||
        typeof value.expectedVersion !== 'number'
    ) {
        throw new Error('INVALID_INPUT')
    }

    return {
        productId: value.productId,
        userId: value.userId,
        quantity: value.quantity,
        expectedVersion: value.expectedVersion,
    }
}