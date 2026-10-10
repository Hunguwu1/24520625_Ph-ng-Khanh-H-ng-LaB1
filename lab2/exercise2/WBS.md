# WBS — Exercise 2: Reactive State Machine & Delegation Hub

## 1. Mục tiêu và phạm vi

Xây dựng Task Manager bằng JavaScript với `useState` tự triển khai bằng closure, cơ chế render lại và Event Delegation tại root. Dữ liệu đi theo một chiều và lịch sử Git có các commit riêng cho từng mốc bắt buộc.

- Thư mục bài làm: `lab2/exercise2`.
- Kho Git quản lý bài làm: `D:/homework`.
- Ngày cập nhật: 10/10/2026.
- Chức năng: thêm công việc, đổi trạng thái hoàn thành, lọc và xóa công việc.
- Bộ lọc: `ALL`, `ACTIVE`, `COMPLETED`.
- Phạm vi hiện tại: một component ứng dụng; Event Hub xử lý sự kiện `click`.

## 2. Phân rã công việc

| Mã WBS | Công việc | Sản phẩm / tiêu chí hoàn thành | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| 1.0 | Chuẩn bị dự án | Có cấu trúc thư mục và trang khởi động | — | Hoàn thành |
| 1.1 | Tạo `index.html` và thư mục `src` | Trang có root `#app` và tải `main.js` bằng module | — | Hoàn thành |
| 1.2 | Dùng lại renderer bài 1 | Có `createElement()` và `renderToDOM()` trong `src/mini-react.js` | 1.1 | Hoàn thành |
| 2.0 | Xây dựng bộ lưu trữ state | Có dữ liệu state và con trỏ dùng giữa các lần render | 1.0 | Hoàn thành |
| 2.1 | Tạo `stateStore` | Mảng lưu giá trị state ở phạm vi module | 1.2 | Hoàn thành |
| 2.2 | Tạo `refCursor` | Con trỏ xác định vị trí của từng lần gọi `useState` | 2.1 | Hoàn thành |
| 3.0 | Triển khai cập nhật state và render | Setter cập nhật đúng state rồi làm mới giao diện | 2.0 | Hoàn thành |
| 3.1 | Viết `useState(initialValue)` | Khởi tạo state một lần, tăng con trỏ, trả về `[state, setter]` | 2.2 | Hoàn thành |
| 3.2 | Viết setter bằng closure | Ghi nhớ vị trí state; nhận giá trị mới hoặc hàm cập nhật | 3.1 | Hoàn thành |
| 3.3 | Viết `renderApp()` | Ghi nhớ component và root; reset con trỏ trước khi render; giữ dữ liệu state | 3.2 | Hoàn thành |
| 4.0 | Xây dựng Event Delegation Hub | Root nhận click và gọi handler của phần tử con | 3.0 | Hoàn thành |
| 4.1 | Lưu handler bằng `WeakMap` | Renderer đăng ký handler mà không gắn listener lên nút | 1.2 | Hoàn thành |
| 4.2 | Gắn listener trên root | Dùng `WeakSet` để tránh gắn listener trùng khi render lại | 4.1 | Hoàn thành |
| 4.3 | Tích hợp Event Hub | Renderer dùng `registerClickHandler`; `renderApp` gọi `attachEventHub` | 3.3, 4.2 | Hoàn thành |
| 5.0 | Xây dựng Task Manager | Giao diện quản lý công việc phản ứng theo state | 4.0 | Hoàn thành |
| 5.1 | Tạo state `tasks` và `filter` | Task có `id`, `title`, `completed`; bộ lọc mặc định là `ALL` | 3.3 | Hoàn thành |
| 5.2 | Thêm và đổi trạng thái công việc | Dùng setter để tạo mảng mới và cập nhật giao diện | 5.1 | Hoàn thành |
| 5.3 | Lọc danh sách | Tính `visibleTasks` từ `tasks` và `filter`, không lưu state dư thừa | 5.1 | Hoàn thành |
| 5.4 | Xóa công việc và hiển thị danh sách rỗng | Xóa bằng `filter`; hiển thị thông báo khi không có kết quả | 5.2, 5.3 | Hoàn thành |
| 5.5 | Kết nối trang khởi động | `main.js` gọi `renderApp(TaskApp, root)` | 5.4 | Hoàn thành |
| 6.0 | Kiểm tra checkpoint | Chức năng chạy đúng và cơ chế sự kiện đáp ứng đề | 5.0 | Hoàn thành |
| 6.1 | Kiểm tra thao tác trên trình duyệt | Thêm, hoàn thành, lọc và xóa chạy đúng; không ghi nhận lỗi JavaScript | 5.5 | Hoàn thành |
| 6.2 | Kiểm tra cơ chế listener qua mã nguồn | Listener click chỉ gắn trên root; các nút không gọi `addEventListener` | 4.3 | Hoàn thành |
| 6.3 | Kiểm tra luồng dữ liệu và lịch sử Git | Luồng một chiều; đủ bốn commit bắt buộc | 6.1, 6.2 | Hoàn thành |
| 7.0 | Lập tài liệu WBS | Có file phân rã công việc, mốc Git và kết quả kiểm tra | 6.0 | Hoàn thành |

## 3. Các mốc Git bắt buộc

| Mốc | Commit | Nội dung |
|---|---|---|
| M1 — State store và con trỏ | `ad6682a` | `feat(state): implement stateStore and refCursor engine` |
| M2 — useState và render lại | `50c1282` | `feat(state): implement reactive useState dispatcher` |
| M3 — Event Delegation | `a322a1f` | `feat(events): attach root event delegation listener` |
| M4 — Giao diện Task Manager | `696881c` | `feat(ui): assemble reactive todo application` |

Các mốc trên đã được lưu trong lịch sử Git. Việc tạo `WBS.md` không thay thế các commit chức năng bắt buộc.

## 4. Luồng dữ liệu

```text
Người dùng nhấn nút
→ Sự kiện click nổi lên root #app
→ Event Hub tìm và gọi handler
→ Handler gọi setter
→ Setter cập nhật stateStore
→ renderApp reset refCursor và chạy TaskApp
→ Renderer cập nhật DOM bên trong root
```

## 5. Kết quả kiểm tra

| Nội dung kiểm tra | Phương pháp | Kết quả |
|---|---|---|
| Thêm công việc | Thao tác trên trình duyệt | Tổng số tăng từ 2 lên 3, công việc mới xuất hiện |
| Đổi trạng thái | Nhấn Hoàn thành | Công việc chuyển sang dấu `✓`, nút chuyển thành Làm lại |
| Bộ lọc | Chuyển giữa ba bộ lọc | Danh sách hiển thị đúng theo trạng thái |
| Giữ dữ liệu giữa các lần render | Thêm, hoàn thành rồi đổi bộ lọc | Dữ liệu và trạng thái hoàn thành được giữ lại |
| Xóa công việc | Xóa công việc vừa thêm | Công việc biến mất, tổng số giảm từ 3 về 2 |
| Lỗi JavaScript | Đọc log trình duyệt trong lần kiểm tra | Không ghi nhận lỗi JavaScript |
| Listener trên root và nút con | Đối chiếu `event-hub.js` và `mini-react.js` | Listener gắn tại root; nút con chỉ đăng ký handler trong `WeakMap` |
| Chống listener trùng | Đối chiếu `attachedRoots` và `attachEventHub` | Root đã đăng ký được bỏ qua trong các lần render sau |
| Commit bắt buộc | Đọc lịch sử Git | Có đủ bốn mốc M1–M4 |

## 6. Các file bàn giao

- `index.html`: root và điểm tải module.
- `src/main.js`: khởi động ứng dụng.
- `src/mini-react.js`: tạo VNode và chuyển VNode thành DOM.
- `src/reactive-engine.js`: lưu state, `useState` và `renderApp`.
- `src/event-hub.js`: đăng ký handler và xử lý click tại root.
- `src/task-app.js`: giao diện và thao tác quản lý công việc.
- `WBS.md`: phân rã công việc và kết quả kiểm tra.

Để chạy bài, phục vụ `index.html` qua máy chủ HTTP, chẳng hạn Live Server, vì các file JavaScript sử dụng ES modules.
