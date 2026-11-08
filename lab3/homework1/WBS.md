# WBS — Lab 3 HW 1: Production Studio Drum Kit

Ngày cập nhật: 08/11/2026. Kết quả kiểm thử được ghi nhận ngày 06/11/2026; build và lint được chạy lại thành công trước khi publish ngày 08/11/2026.

## 1. Mục tiêu

Nâng cấp Drum Kit từ bài Lab 1 thành ứng dụng React + TypeScript, áp dụng kỹ thuật bàn phím, focus và hỗ trợ tiếp cận từ Lab 2 HW 1. Sản phẩm hướng đến yêu cầu WCAG 2.2 AA và điểm Lighthouse 100 trong đề bài.

- Thư mục dự án: `D:\homework\lab3\homework1`.
- Bài Drum Kit tham khảo: `D:\homework\24520625_Ph-ng-Khanh-H-ng-LaB1\homework2`.
- Bài Lab 2 tham khảo: `D:\homework\lab2\homework1`.
- Công nghệ: React, TypeScript, Vite, CSS, Web Audio API, Oxlint.
- Thời lượng theo đề: một tuần; không phải thời gian thực hiện đã đo.
- Chi tiết từng nhiệm vụ: [TASK_DECOMPOSITION.md](./TASK_DECOMPOSITION.md).

## 2. Phạm vi sản phẩm

Ứng dụng có bảy pad W/A/S/D/J/K/L, phát âm thanh bằng chuột và bàn phím, chặn tự lặp khi giữ phím, bỏ qua phím tắt khi nhập liệu, cho phép bật/tắt phím tắt, hiển thị pad đang kích hoạt, lịch sử mười lần đánh và mức tín hiệu âm thanh thực.

Chức năng ghi và phát lại nhịp có trong bài cũ chưa được chuyển sang bản hiện tại; không được tính là chức năng đã bàn giao trong WBS này. Phạm vi được lập theo nội dung đề đã cung cấp trong ảnh.

## 3. Cấu trúc phân rã công việc

| Mã WBS | Gói công việc | Sản phẩm / điều kiện hoàn thành | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| 1.1 | Đọc yêu cầu và khảo sát bài cũ | Xác định chức năng, mã nguồn cũ và kỹ thuật từ Lab 2 có thể áp dụng | — | Hoàn thành |
| 1.2 | Khởi tạo dự án | React + TypeScript chạy bằng Vite; có lệnh build và lint | 1.1 | Hoàn thành |
| 2.1 | Định nghĩa dữ liệu pad | Kiểu `DrumPad` có id, name, key, code và src | 1.2 | Hoàn thành |
| 2.2 | Chuẩn bị bảy âm thanh | Có đủ file WAV/MP3, đường dẫn hợp lệ; lưu nguồn của bốn file bổ sung | 2.1 | Hoàn thành; đã bổ sung lại credits ngày 08/11/2026 |
| 2.3 | Dựng giao diện pad | Bảy nút HTML thật, tên và phím hiển thị đúng | 2.1, 2.2 | Hoàn thành |
| 3.1 | Nhận phím vật lý | Tra pad bằng `KeyboardEvent.code`, không dùng keyCode | 2.1 | Hoàn thành |
| 3.2 | Chặn thao tác không phù hợp | Bỏ qua repeat, Ctrl/Alt/Meta và vùng nhập liệu | 3.1 | Hoàn thành |
| 3.3 | Công tắc phím tắt | Tắt phím chữ nhưng nút vẫn hoạt động bằng click, Enter và Space | 3.2, 2.3 | Hoàn thành |
| 3.4 | Quản lý focus và vòng đời | Có focus rõ, Tab rời được vùng pad, gỡ event listener khi không dùng | 3.3 | Hoàn thành; đã kiểm tra tự động |
| 4.1 | Phát âm thanh bằng Web Audio | Tạo AudioContext khi người dùng tương tác; giải mã và phát file | 2.2, 2.3 | Hoàn thành |
| 4.2 | Cache và âm thanh chồng nhau | Cache Promise giải mã; mỗi lần đánh dùng source riêng | 4.1 | Đã triển khai; chưa đánh giá chất lượng nghe trực tiếp |
| 4.3 | Xử lý lỗi và dọn tài nguyên | Thông báo lỗi phát; hủy interval, ngắt analyser và đóng context | 4.1 | Đã triển khai; chưa thử riêng mọi nhánh lỗi |
| 5.1 | Hiệu ứng pad đang đánh | `aria-pressed` và màu pad thay đổi khoảng 150 ms; timer riêng mỗi pad | 2.3, 3.1 | Hoàn thành; đã kiểm tra tự động |
| 5.2 | Lịch sử và thông báo | Giữ mười lần đánh mới nhất; `<output aria-live="polite">` | 5.1 | Đã triển khai và kiểm tra cập nhật; chờ NVDA trực tiếp |
| 5.3 | Đo mức tín hiệu | Analyser tính RMS và dBFS; meter giới hạn từ -60 đến 0 | 4.1 | Hoàn thành; đã kiểm tra tăng và trở về mức thấp nhất |
| 6.1 | Ngữ nghĩa và tên truy cập | Ngôn ngữ tiếng Việt, nhãn input/meter, tên nút từ nội dung, aria-keyshortcuts | 2.3, 3.3, 5.3 | Hoàn thành qua mã nguồn và kiểm tra tự động |
| 6.2 | Tương phản và focus | Sửa màu liên kết; viền focus rõ cho pad, ô nhập và liên kết | 6.1 | Hoàn thành trong các trạng thái đã kiểm tra |
| 6.3 | Bố cục thích ứng | Không tràn ngang ở 320/390/640 CSS px; lưu ảnh desktop và mobile | 2.3, 5.3 | Hoàn thành; zoom 200% thật còn chờ |
| 6.4 | Thông tin trang | Tiêu đề, description và robots.txt hợp lệ | 1.2 | Hoàn thành |
| 7.1 | Kiểm tra chức năng | Bảy phím, giữ phím, vùng nhập, công tắc, lịch sử, trạng thái pad và meter | 3.1–5.3 | Đạt trong báo cáo tự động |
| 7.2 | Kiểm tra file âm thanh | Cả bảy file giải mã được và có thời lượng lớn hơn 0 | 2.2, 4.1 | Đạt |
| 7.3 | Quét axe và Lighthouse | Không có vi phạm axe trong nhóm đã chạy; lưu báo cáo Lighthouse | 6.1–6.4, 7.1 | Đạt; Lighthouse mobile 100 ở bốn hạng mục |
| 7.4 | Kiểm tra build và lint | `npm run build` và `npm run lint` thành công | 7.1 | Đạt ngày 06/11/2026 |
| 7.5 | Thử UniKey trực tiếp | Phím hoạt động ở chế độ tiếng Việt; gõ ghi chú không đánh trống | 3.2, 3.3 | Chưa thực hiện trực tiếp; đã mô phỏng key khác code |
| 7.6 | Thử NVDA trực tiếp | Kiểm tra tên, trạng thái, thao tác và thông báo lịch sử | 6.1, 5.2 | Chưa thực hiện |
| 7.7 | Zoom và nghe trực tiếp | Zoom trình duyệt 200%; nghe từng pad và các tiếng chồng nhau | 6.3, 4.2 | Chưa thực hiện trực tiếp |
| 7.8 | Đối chiếu WCAG đầy đủ | Liệt kê tiêu chí A/AA áp dụng, kết quả và bằng chứng | 7.3, 7.5–7.7 | Chưa xác nhận đầy đủ |
| 8.1 | Lưu bằng chứng | Báo cáo, dữ liệu kiểm tra và ảnh trong artifacts | 7.1–7.4 | Hoàn thành phần tự động |
| 8.2 | Tài liệu bàn giao | WBS, task decomposition và giới hạn kiểm thử | 8.1 | Hoàn thành trong hai tài liệu này |
| 8.3 | Chốt nghiệm thu thủ công | Bổ sung bằng chứng UniKey/NVDA/zoom/nghe và xử lý lỗi nếu có | 7.5–7.8 | Chờ thực hiện |

## 4. Mốc nghiệm thu

| Mốc | Nội dung | Trạng thái |
|---|---|---|
| M1 | Khởi tạo React và ba pad ban đầu | Hoàn thành |
| M2 | Bàn phím, chống repeat, vùng nhập và công tắc | Hoàn thành |
| M3 | Pad sáng, lịch sử và đủ bảy âm thanh | Hoàn thành |
| M4 | Web Audio và meter tín hiệu thực | Hoàn thành |
| M5 | Build, lint, kiểm thử tự động và Lighthouse | Hoàn thành |
| M6 | Kiểm thử thủ công và đối chiếu WCAG đầy đủ | Chưa hoàn thành |

## 5. Kết quả và bằng chứng hiện có

| Nội dung | Kết quả | Bằng chứng |
|---|---|---|
| Lighthouse mobile | Performance 100; Accessibility 100; Best Practices 100; SEO 100 | [HTML](./artifacts/lighthouse-report.html), [JSON](./artifacts/lighthouse-report.json) |
| Kiểm tra chức năng | Các nhóm trong báo cáo đều đạt | [functional-results.json](./artifacts/functional-results.json) |
| File âm thanh | Bảy file giải mã được | [audio-validation.json](./artifacts/audio-validation.json) |
| Axe | Không phát hiện vi phạm trong nhóm kiểm tra đã chạy | [axe-results.json](./artifacts/axe-results.json) |
| Giao diện | Ảnh desktop 1280 px và mobile 390 px | [Desktop](./artifacts/drum-kit-desktop.png), [Mobile](./artifacts/drum-kit-mobile.png) |
| Reflow mô phỏng | Bố cục ở 640 CSS px | [Ảnh bố cục](./artifacts/drum-kit-200-percent-layout.png) |
| Báo cáo tổng hợp | Môi trường, kết quả và giới hạn | [verification.md](./artifacts/verification.md) |
| Nguồn âm thanh bổ sung | Bốn MP3 từ teropa/drumkit; đã lưu credits và README gốc | [CREDITS.md](./public/sounds/CREDITS.md), [UPSTREAM-README.md](./public/sounds/UPSTREAM-README.md) |

## 6. Điều kiện chốt bài

- [x] Chức năng chính và các phím trong đề đã triển khai.
- [x] Có lịch sử trực quan, trạng thái pad và mức tín hiệu thực.
- [x] Build/lint thành công và lưu báo cáo tự động.
- [x] Lighthouse đạt 100 ở bốn hạng mục trong lần đo mobile trên localhost.
- [ ] Thử trực tiếp UniKey và lưu video hoặc biên bản thao tác.
- [x] Bổ sung lại hai file credits và xác nhận file đích của liên kết nguồn âm thanh ở footer tồn tại.
- [ ] Thử trực tiếp NVDA, bao gồm tên nút, trạng thái công tắc và thông báo lịch sử.
- [ ] Thử zoom trình duyệt 200% thật và nghe âm thanh trên thiết bị.
- [ ] Đối chiếu toàn bộ tiêu chí WCAG A/AA áp dụng nếu cần tuyên bố tuân thủ đầy đủ.

Điểm Lighthouse và kết quả axe không thay thế đánh giá thủ công toàn bộ WCAG. Không ghi các mục còn chờ là đã đạt khi chưa có kết quả thực tế.

## 7. Các file triển khai chính

| File | Vai trò |
|---|---|
| `src/App.tsx` | Dữ liệu pad, giao diện, kích hoạt pad, lịch sử và tích hợp hook |
| `src/useDrumKeyboard.ts` | Kiểu DrumPad, phím vật lý, bộ lọc và vòng đời listener |
| `src/useDrumAudio.ts` | Phát âm thanh, cache, analyser, meter và lỗi |
| `src/App.css`, `src/index.css` | Bố cục, màu, focus và trạng thái |
| `public/sounds/` | Bảy WAV/MP3 và các file thông tin nguồn |
| `index.html`, `public/robots.txt` | Ngôn ngữ, metadata và cấu hình crawler |
| `artifacts/tools/` | Công cụ kiểm tra trình duyệt và Lighthouse |

## 8. Cách chạy

```powershell
npm ci
npm run dev
```

Kiểm tra bản production:

```powershell
npm run build
npm run lint
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Giữ preview chạy; trong terminal khác chạy lần lượt `node artifacts/tools/check-app.mjs` và `node artifacts/tools/run-lighthouse.mjs`. Công cụ hiện dùng đường dẫn Chrome mặc định trên máy làm bài và dependencies riêng trong `artifacts/tools`.
