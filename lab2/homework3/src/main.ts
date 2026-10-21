import './style.css'
import { getProduct } from './api/client'
import { createAntiDriftTimer, formatCountdown } from './timer/countdown'

function element<T extends HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector)

  if (!found) {
    throw new Error(`Không tìm thấy phần tử ${selector}`)
  }

  return found
}

const app = element<HTMLDivElement>('#app')

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

let stopTimer: (() => void) | undefined
let disposed = false

async function loadProduct(): Promise<void> {
  stopTimer?.()
  stopTimer = undefined
  app.textContent = 'Đang tải sản phẩm...'

  try {
    const snapshot = await getProduct('product-001')

    if (disposed) {
      return
    }

    const { product, inventory, flashSale, serverOffsetMs } = snapshot

    app.innerHTML = `
      <main class="product-card">
        <p class="badge">FLASH SALE</p>
        <h1 id="product-name"></h1>

        <p id="original-price" class="original-price"></p>
        <p id="sale-price" class="sale-price"></p>

        <p>Còn lại: <strong id="available-stock"></strong> sản phẩm</p>

        <div class="countdown">
          <p id="sale-status"></p>
          <p id="sale-timer" class="timer">--:--.---</p>
        </div>

        <button type="button" disabled>Mua ngay</button>
      </main>
    `

    element<HTMLElement>('#product-name').textContent = product.name
    element<HTMLElement>('#original-price').textContent =
      currencyFormatter.format(product.originalPrice)
    element<HTMLElement>('#sale-price').textContent =
      currencyFormatter.format(product.salePrice)
    element<HTMLElement>('#available-stock').textContent =
      String(inventory.available)

    const timerElement = element<HTMLElement>('#sale-timer')
    const statusElement = element<HTMLElement>('#sale-status')

    const localStartsAt = flashSale.startsAt - serverOffsetMs
    const localEndsAt = flashSale.endsAt - serverOffsetMs

    stopTimer = createAntiDriftTimer(localEndsAt, (remainingMs) => {
      const untilStart = Math.max(0, localStartsAt - Date.now())

      timerElement.textContent = formatCountdown(
        untilStart > 0 ? untilStart : remainingMs,
      )

      statusElement.textContent = untilStart > 0
        ? 'Bắt đầu sau'
        : remainingMs > 0
          ? 'Kết thúc sau'
          : 'Flash Sale đã kết thúc'
    })
  } catch (error) {
    if (disposed) {
      return
    }

    console.error(error)
    app.textContent =
      'Không tải được sản phẩm. Hãy kiểm tra backend rồi tải lại trang.'
  }
}

void loadProduct()

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    disposed = true
    stopTimer?.()
  })
}