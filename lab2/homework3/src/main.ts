import './style.css'
import { flashSale, inventory, product } from './data/demo'
import {
  createAntiDriftTimer,
  formatCountdown,
} from './timer/countdown'

// Bộ định dạng tiền Việt Nam.
const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

// Tìm phần tử chứa ứng dụng trong index.html.
const app = document.querySelector<HTMLDivElement>('#app')

// Dừng sớm nếu cấu trúc HTML thiếu phần tử cần thiết.
if (!app) {
  throw new Error('Không tìm thấy phần tử #app')
}

// Hiển thị dữ liệu mẫu lên trang.
app.innerHTML = `
  <main class="product-card">
    <p class="badge">FLASH SALE</p>

    <h1>${product.name}</h1>

    <p class="original-price">
      ${currencyFormatter.format(product.originalPrice)}
    </p>

    <p class="sale-price">
      ${currencyFormatter.format(product.salePrice)}
    </p>

    <p>Còn lại: <strong>${inventory.available}</strong> sản phẩm</p>
    <div class="countdown">
  <p id="sale-status">Kết thúc sau</p>
  <p id="sale-timer" class="timer">--:--.---</p>
</div>

    <button type="button" disabled>Mua ngay</button>

    <p class="note">Chức năng mua hàng sẽ được thêm ở bước sau.</p>
  </main>
`
const timerElement =
  document.querySelector<HTMLParagraphElement>('#sale-timer')

const statusElement =
  document.querySelector<HTMLParagraphElement>('#sale-status')

if (!timerElement || !statusElement) {
  throw new Error('Không tìm thấy phần tử hiển thị đồng hồ')
}

const stopTimer = createAntiDriftTimer(
  flashSale.endsAt,
  (remainingMs) => {
    timerElement.textContent = formatCountdown(remainingMs)

    statusElement.textContent =
      remainingMs > 0 ? 'Kết thúc sau' : 'Flash Sale đã kết thúc'
  },
)

// Dọn đồng hồ cũ khi Vite thay thế module trong lúc phát triển.
if (import.meta.hot) {
  import.meta.hot.dispose(stopTimer)
}