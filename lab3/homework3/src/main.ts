import './style.css'
import { confirmCheckout, getProduct, reserveProduct } from './api/client'
import type { Inventory, Reservation } from './domain/models'
import { createAntiDriftTimer, formatCountdown } from './timer/countdown'

function element<T extends HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector)
  if (!found) throw new Error(`Không tìm thấy ${selector}`)
  return found
}

const productId = 'product-001'
const userKey = 'hw3-user-id'
const holdKey = 'hw3-current-hold'
const userId = sessionStorage.getItem(userKey) ?? crypto.randomUUID()
sessionStorage.setItem(userKey, userId)

const money = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

const app = element<HTMLDivElement>('#app')
app.innerHTML = `
  <main class="product-card">
    <p class="badge">FLASH SALE</p>
    <h1 id="product-name">Đang tải sản phẩm...</h1>
    <p id="original-price" class="original-price"></p>
    <p id="sale-price" class="sale-price"></p>
    <p>Còn lại: <strong id="available-stock">—</strong> sản phẩm</p>
    <div class="countdown">
      <p id="sale-status"></p>
      <p id="sale-timer" class="timer">--:--.---</p>
    </div>
    <button id="buy-button" type="button" disabled>Mua ngay — 1 sản phẩm</button>
    <section id="hold-panel" class="hold-panel" hidden>
      <p>Thời gian giữ hàng còn lại:</p>
      <p id="hold-timer" class="timer">--:--.---</p>
      <button id="checkout-button" type="button" disabled>Thanh toán</button>
    </section>
    <p id="purchase-message" class="purchase-message" aria-live="polite"></p>
  </main>
`

const ui = {
  name: element<HTMLElement>('#product-name'),
  originalPrice: element<HTMLElement>('#original-price'),
  salePrice: element<HTMLElement>('#sale-price'),
  stock: element<HTMLElement>('#available-stock'),
  saleStatus: element<HTMLElement>('#sale-status'),
  saleTimer: element<HTMLElement>('#sale-timer'),
  buy: element<HTMLButtonElement>('#buy-button'),
  holdPanel: element<HTMLElement>('#hold-panel'),
  holdTimer: element<HTMLElement>('#hold-timer'),
  checkout: element<HTMLButtonElement>('#checkout-button'),
  message: element<HTMLElement>('#purchase-message'),
}

let snapshot: Awaited<ReturnType<typeof getProduct>> | undefined
let reservation: Reservation | undefined
let paymentAttempted = false
let busy = false
let disposed = false
let refreshing = false
let refreshVersion = 0
let stopSaleTimer = () => {}
let stopHoldTimer = () => {}

// Khôi phục lượt giữ đã nhận thành công trước khi tải lại trang.
try {
  const stored = JSON.parse(sessionStorage.getItem(holdKey) ?? 'null') as {
    reservation?: Partial<Reservation>
    paymentAttempted?: boolean
  } | null

  const cached = stored?.reservation

  if (
    cached?.productId === productId &&
    cached.userId === userId &&
    typeof cached.id === 'string' && cached.id.length > 0 &&
    typeof cached.expiresAt === 'number' &&
    Number.isSafeInteger(cached.expiresAt) &&
    cached.quantity === 1 &&
    cached.status === 'ACTIVE'
  ) {
    reservation = cached as Reservation
    paymentAttempted = stored?.paymentAttempted === true
  } else {
    sessionStorage.removeItem(holdKey)
  }
} catch {
  sessionStorage.removeItem(holdKey)
}

function persistHold(): void {
  if (reservation) {
    sessionStorage.setItem(
      holdKey,
      JSON.stringify({ reservation, paymentAttempted }),
    )
  } else {
    sessionStorage.removeItem(holdKey)
  }
}

function serverNow(): number {
  return Date.now() + (snapshot?.serverOffsetMs ?? 0)
}

function showMessage(text: string, kind = 'info'): void {
  ui.message.textContent = text
  ui.message.dataset.kind = kind
}

function updateButtons(): void {
  const now = serverNow()
  const saleOpen = !!snapshot &&
    now >= snapshot.flashSale.startsAt && now < snapshot.flashSale.endsAt

  ui.buy.disabled = busy || !!reservation || !saleOpen ||
    !snapshot || snapshot.inventory.available <= 0

  ui.holdPanel.hidden = !reservation
  ui.checkout.disabled = busy || !reservation
  ui.checkout.textContent = busy
    ? 'Đang xử lý...'
    : paymentAttempted ? 'Kiểm tra thanh toán' : 'Thanh toán'
}

function applyInventory(inventory: Inventory): void {
  // Không để một GET cũ ghi đè tồn kho vừa nhận từ POST.
  refreshVersion++
  if (snapshot) snapshot.inventory = inventory
  ui.stock.textContent = String(inventory.available)
}

function clearHold(): void {
  stopHoldTimer()
  reservation = undefined
  paymentAttempted = false
  persistHold()
}

function checkLocalExpiry(): void {
  if (
    reservation && !paymentAttempted && !busy &&
    serverNow() >= reservation.expiresAt
  ) {
    clearHold()
    showMessage('Lượt giữ đã hết hạn. Bạn có thể mua lại.')
    void refreshProduct().catch(console.error)
  }
}

function startHoldTimer(): void {
  stopHoldTimer()
  if (!reservation || !snapshot) return

  const endsAt = reservation.expiresAt - snapshot.serverOffsetMs

  stopHoldTimer = createAntiDriftTimer(endsAt, (remainingMs) => {
    ui.holdTimer.textContent = formatCountdown(remainingMs)
    checkLocalExpiry()
    updateButtons()
  })
}

async function refreshProduct(): Promise<void> {
  if (refreshing || disposed) return
  refreshing = true
  const version = ++refreshVersion

  try {
    const next = await getProduct(productId)
    if (disposed || version !== refreshVersion) return

    snapshot = next
    ui.name.textContent = next.product.name
    ui.originalPrice.textContent = money.format(next.product.originalPrice)
    ui.salePrice.textContent = money.format(next.product.salePrice)
    ui.stock.textContent = String(next.inventory.available)

    stopSaleTimer()
    stopSaleTimer = createAntiDriftTimer(
      next.flashSale.endsAt - next.serverOffsetMs,
      (remainingMs) => {
        const untilStart = Math.max(0, next.flashSale.startsAt - serverNow())

        ui.saleTimer.textContent = formatCountdown(
          untilStart > 0 ? untilStart : remainingMs,
        )
        ui.saleStatus.textContent = untilStart > 0
          ? 'Bắt đầu sau'
          : remainingMs > 0 ? 'Kết thúc sau' : 'Flash Sale đã kết thúc'

        updateButtons()
      },
    )

    if (reservation) startHoldTimer()
    updateButtons()
  } finally {
    refreshing = false
  }
}

function messageFor(error: unknown): string {
  const code = error instanceof Error ? error.message : ''
  const messages: Record<string, string> = {
    VERSION_CONFLICT: 'Kho vừa thay đổi. Hãy bấm Mua ngay để thử lại.',
    OUT_OF_STOCK: 'Sản phẩm đã hết hàng.',
    SALE_INACTIVE: 'Phiên Flash Sale chưa bắt đầu hoặc đã kết thúc.',
    RESERVATION_EXPIRED: 'Lượt giữ đã hết hạn. Bạn có thể mua lại.',
    RESERVATION_NOT_FOUND: 'Lượt giữ không còn tồn tại. Hãy mua lại.',
    RESERVATION_NOT_ACTIVE: 'Lượt giữ này không thể thanh toán.',
    FORBIDDEN: 'Bạn không sở hữu lượt giữ này.',
    INVALID_INPUT: 'Dữ liệu gửi lên chưa hợp lệ.',
  }

  return Object.hasOwn(messages, code)
    ? messages[code]!
    : paymentAttempted
      ? 'Chưa nhận được kết quả. Bấm Kiểm tra thanh toán để thử lại.'
      : 'Không kết nối được backend. Hãy kiểm tra rồi thử lại.'
}

async function runAction(action: () => Promise<void>): Promise<void> {
  if (busy || !snapshot || disposed) return

  busy = true
  showMessage('Đang xử lý...')
  updateButtons()

  try {
    await action()
  } catch (error) {
    if (!disposed) {
      console.error(error)
      showMessage(messageFor(error), 'error')
      try {
        await refreshProduct()
      } catch (refreshError) {
        console.error(refreshError)
      }
    }
  } finally {
    busy = false
    if (!disposed) {
      checkLocalExpiry()
      updateButtons()
    }
  }
}

ui.buy.addEventListener('click', () => {
  void runAction(async () => {
    if (!snapshot || reservation) return

    const result = await reserveProduct({
      productId,
      userId,
      quantity: 1,
      expectedVersion: snapshot.inventory.version,
    })

    if (disposed) return

    reservation = result.reservation
    paymentAttempted = false
    persistHold()
    applyInventory(result.inventory)
    showMessage('Đã giữ 1 sản phẩm. Hãy thanh toán trước khi hết hạn.')
    startHoldTimer()
  })
})

ui.checkout.addEventListener('click', () => {
  void runAction(async () => {
    if (!reservation) return

    paymentAttempted = true
    persistHold()

    try {
      const result = await confirmCheckout(reservation.id, userId)
      if (disposed) return

      applyInventory(result.inventory)
      clearHold()
      showMessage(
        `Thanh toán thành công!\nMã đơn: ${result.order.id}\nTổng tiền: ${money.format(result.order.totalAmount)}`,
        'success',
      )
    } catch (error) {
      const code = error instanceof Error ? error.message : ''

      if ([
        'RESERVATION_EXPIRED',
        'RESERVATION_NOT_FOUND',
        'RESERVATION_NOT_ACTIVE',
        'FORBIDDEN',
      ].includes(code)) {
        clearHold()
      }

      throw error
    }
  })
})

void refreshProduct().catch((error) => {
  if (!disposed) showMessage(messageFor(error), 'error')
})

// Cập nhật tồn kho khi có người mua ở tab khác.
const polling = setInterval(() => {
  if (!busy) void refreshProduct().catch(console.error)
}, 2000)

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    disposed = true
    clearInterval(polling)
    stopSaleTimer()
    stopHoldTimer()
  })
}
