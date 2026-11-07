import type { IncomingMessage } from 'node:http'

async function readJsonObject(
    request: IncomingMessage,
): Promise<Record<string, unknown>> {
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

    return data as Record<string, unknown>
}

export async function readReservationInput(request: IncomingMessage) {
    const value = await readJsonObject(request)

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

export async function readCheckoutInput(request: IncomingMessage) {
    const value = await readJsonObject(request)

    if (
        typeof value.reservationId !== 'string' ||
        !value.reservationId.trim() ||
        typeof value.userId !== 'string' ||
        !value.userId.trim()
    ) {
        throw new Error('INVALID_INPUT')
    }

    return {
        reservationId: value.reservationId.trim(),
        userId: value.userId.trim(),
    }
}