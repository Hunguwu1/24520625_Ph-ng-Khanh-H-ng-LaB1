import { createServer } from 'node:http'
import type { ServerResponse } from 'node:http'
import { readReservationInput } from './http.ts'
import { reserveInventory } from './reservations.ts'
import { flashSale, getInventory, product } from './store.ts'
import { expireReservations } from './expiration.ts'
const port = 3000

const errorStatuses = new Map<string, number>([
    ['INVALID_JSON', 400],
    ['INVALID_INPUT', 400],
    ['PRODUCT_NOT_FOUND', 404],
    ['VERSION_CONFLICT', 409],
    ['OUT_OF_STOCK', 409],
    ['SALE_INACTIVE', 409],
    ['PAYLOAD_TOO_LARGE', 413],
    ['UNSUPPORTED_MEDIA_TYPE', 415],
])

function sendJson(
    response: ServerResponse,
    statusCode: number,
    data: unknown,
): void {
    response.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
    })

    response.end(JSON.stringify(data))
}


const server = createServer(async (request, response) => {
    try {
        const url = new URL(request.url ?? '/', `http://127.0.0.1:${port}`)

        const allowedMethod =
            url.pathname === '/api/health' ||
                url.pathname === `/api/products/${product.id}`
                ? 'GET'
                : url.pathname === '/api/reservations'
                    ? 'POST'
                    : undefined

        if (!allowedMethod) {
            request.resume()
            sendJson(response, 404, { error: 'NOT_FOUND' })
            return
        }

        if (request.method !== allowedMethod) {
            request.resume()
            response.setHeader('Allow', allowedMethod)
            sendJson(response, 405, { error: 'METHOD_NOT_ALLOWED' })
            return
        }

        if (url.pathname === '/api/health') {
            sendJson(response, 200, { status: 'ok', serverNow: Date.now() })
            return
        }

        if (url.pathname === `/api/products/${product.id}`) {
            expireReservations()

            sendJson(response, 200, {
                product,
                inventory: getInventory(),
                flashSale,
                serverNow: Date.now(),
            })
            return
        }

        const input = await readReservationInput(request)
        const reservation = reserveInventory(input)

        sendJson(response, 201, {
            reservation,
            inventory: getInventory(),
            serverNow: Date.now(),
        })
    } catch (error) {
        if (response.destroyed || response.writableEnded) {
            return
        }

        const code = error instanceof Error ? error.message : 'INTERNAL_ERROR'
        const statusCode = errorStatuses.get(code) ?? 500

        if (statusCode === 500) {
            console.error(error)
        }

        sendJson(response, statusCode, {
            error: statusCode === 500 ? 'INTERNAL_ERROR' : code,
        })
    }

})

const expiryTimer = setInterval(() => {
    try {
        expireReservations()
    } catch (error) {
        console.error('Không thể xử lý lượt giữ hết hạn:', error)
    }
}, 1000)

expiryTimer.unref()

server.on('close', () => clearInterval(expiryTimer))


server.listen(port, '127.0.0.1', () => {
    console.log(`API đang chạy tại http://127.0.0.1:${port}`)
})
