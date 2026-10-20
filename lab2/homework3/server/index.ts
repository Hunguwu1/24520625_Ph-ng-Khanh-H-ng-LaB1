import { createServer } from 'node:http'
import type { ServerResponse } from 'node:http'
import { flashSale, getInventory, product } from './store.ts'

const port = 3000

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

const server = createServer((request, response) => {
    const url = new URL(
        request.url ?? '/',
        `http://127.0.0.1:${port}`,
    )

    // Bước này chỉ hỗ trợ đọc dữ liệu.
    if (request.method !== 'GET') {
        response.setHeader('Allow', 'GET')

        sendJson(response, 405, {
            error: 'METHOD_NOT_ALLOWED',
            message: 'API hiện chỉ hỗ trợ phương thức GET',
        })

        return
    }

    // Kiểm tra backend có đang hoạt động hay không.
    if (url.pathname === '/api/health') {
        sendJson(response, 200, {
            status: 'ok',
            serverNow: Date.now(),
        })

        return
    }

    // Lấy thông tin sản phẩm đang được mô phỏng.
    if (url.pathname === `/api/products/${product.id}`) {
        sendJson(response, 200, {
            product,
            inventory: getInventory(),
            flashSale,
            serverNow: Date.now(),
        })

        return
    }

    sendJson(response, 404, {
        error: 'NOT_FOUND',
        message: 'Không tìm thấy tài nguyên',
    })
})

server.listen(port, '127.0.0.1', () => {
    console.log(`API đang chạy tại http://127.0.0.1:${port}`)
})