# Kiểm tra responsive và accessibility

Ngày kiểm tra: 08/11/2026. Phạm vi: Homework 2 Piano.

- Chrome headless, Lighthouse Accessibility tại viewport 375 × 812: **100/100**. Xem `lighthouse-375.report.html` và `lighthouse-375.report.json`.
- Đo ở 320, 375, 768 và 1280px: chiều rộng tài liệu bằng viewport; không có phần tử cuộn ngang. Mỗi kích thước vẫn có đủ 88 phím.
- 375px sau khi ghi một nốt và mở bảng dữ liệu: không có phần tử cuộn ngang.
- Ô chọn tốc độ liên kết bằng `label htmlFor` và `id` sinh từ React `useId()`.
- Ngôn ngữ tài liệu: `vi`. Dùng main, section, fieldset/legend, table/caption/th và button theo chức năng. Các div còn lại dùng cho bố cục.
- Kiểm tra bàn phím: giữ Space + Enter, thả Enter vẫn giữ nốt; thả Space thì tắt nốt.
- 24/24 unit tests đạt; build và lint đạt.
- Đã xem ảnh giao diện 375px với bảng ghi mở và chế độ tối.

Lighthouse 100 là kết quả kiểm tra tự động, không phải chứng nhận toàn bộ WCAG 2.2 AA. Chưa kiểm tra thủ công bằng trình đọc màn hình hoặc thiết bị cảm ứng thật.
