# Báo cáo kiểm tra Drum Kit

Ngày kiểm tra: 06/11/2026 (Asia/Saigon).

## Môi trường và kết quả

- Bản production tạo bằng `npm run build`, chạy trên Vite Preview tại http://127.0.0.1:4173.
- Chrome headless, Lighthouse 13.5.0, cấu hình mobile mặc định.
- Lighthouse: Performance **100**, Accessibility **100**, Best Practices **100**, SEO **100**.
- Build và lint: thành công.
- Axe: không phát hiện vi phạm trong nhóm kiểm tra đã chạy (WCAG A/AA 2.0, 2.1, 2.2 và best practices).
- Không ghi nhận lỗi JavaScript hoặc lỗi phát âm thanh trong luồng kiểm tra.

## Kiểm tra chức năng

Tất cả các nhóm kiểm tra trong `functional-results.json` đều đạt:

1. Cả bảy file WAV/MP3 tải và giải mã thành AudioBuffer có thời lượng lớn hơn 0.
2. W/A/S/D/J/K/L kích hoạt đúng pad và lịch sử.
3. Sự kiện giữ phím lặp không thêm lần đánh.
4. Gõ `wasdjkl` trong ghi chú không kích hoạt pad.
5. Tắt phím tắt chặn phím chữ, thao tác nhấp vẫn hoạt động.
6. Trạng thái `aria-pressed` bật khi đánh và tự tắt.
7. Lịch sử chỉ giữ mười lần đánh mới nhất.
8. Meter tăng trên -60 dBFS khi phát Crash và trở về -60 khi tín hiệu kết thúc.
9. Tab/Shift+Tab di chuyển đúng; Enter/Space kích hoạt nút; focus có viền; Tab rời được vùng pad.
10. Mô phỏng `key: "ă"` cùng `code: "KeyA"` vẫn kích hoạt Kick.
11. Không tràn ngang ở chiều rộng 320, 390 và 640 CSS px.

## Các lỗi đã sửa

- Khai báo ngôn ngữ trang thành tiếng Việt, thay tiêu đề mẫu và thêm mô tả trang.
- Tăng độ tương phản liên kết ở trạng thái thường và đã truy cập.
- Thêm viền focus rõ cho liên kết và ô nhập.
- Bỏ aria-label ghi đè trên pad để tên truy cập lấy từ nội dung hiển thị; khai báo phím tắt bằng aria-keyshortcuts.
- Thêm robots.txt hợp lệ, tránh máy chủ trả HTML thay cho file này.

## Bằng chứng

- `lighthouse-report.html`: báo cáo Lighthouse tương tác đầy đủ.
- `lighthouse-report.json`: dữ liệu gốc, môi trường, thời điểm và các khuyến nghị còn lại.
- `axe-results.json`: kết quả axe đầy đủ, bao gồm các mục cần đánh giá thủ công.
- `functional-results.json`: kết quả từng nhóm kiểm tra.
- `audio-validation.json`: thời lượng bảy file đã giải mã.
- `drum-kit-desktop.png`: giao diện rộng 1280 px.
- `drum-kit-mobile.png`: giao diện rộng 390 px.
- `drum-kit-200-percent-layout.png`: giao diện rộng 640 CSS px, mô phỏng chiều rộng bố cục khi cửa sổ 1280 px được zoom 200%.

## Giới hạn

Đây là kiểm tra trình duyệt tự động và xem ảnh bố cục. Chưa thử trực tiếp bộ gõ UniKey hay trình đọc màn hình NVDA. Kiểm tra ký tự và mã phím là mô phỏng; ảnh 640 px là mô phỏng reflow, không phải thao tác zoom trình duyệt thật. File âm thanh được xác nhận giải mã và tạo tín hiệu, chưa đánh giá chất lượng nghe bằng tai hoặc thiết bị loa vật lý.

Điểm Lighthouse 100 là kết quả lần đo này trên localhost và không chứng nhận tuân thủ đầy đủ WCAG 2.2 AA. Báo cáo vẫn có khuyến nghị hiệu năng như JavaScript chưa dùng; chúng không làm giảm điểm các hạng mục trong lần đo này.

## Chạy lại

Tại thư mục dự án, chạy `npm run build`, `npm run lint`, rồi `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort`.

Trong terminal thứ hai, chạy `node artifacts/tools/check-app.mjs`, sau đó `node artifacts/tools/run-lighthouse.mjs`. Các công cụ dùng Chrome tại đường dẫn cài mặc định trên máy hiện tại. Các gói kiểm tra được lưu riêng trong artifacts/tools; không thêm vào dependencies của ứng dụng.
