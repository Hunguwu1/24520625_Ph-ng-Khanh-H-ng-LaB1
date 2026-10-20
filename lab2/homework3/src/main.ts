import './style.css'
import { inventory, product } from './data/demo'

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

    <button type="button" disabled>Mua ngay</button>

    <p class="note">Chức năng mua hàng sẽ được thêm ở bước sau.</p>
  </main>
`