# WBS — Exercise 3: Resilient State Machine & Skeleton Loader

## 1. Mục tiêu và phạm vi

Xây dựng component React quản lý việc tải dữ liệu bất đồng bộ bằng đúng bốn trạng thái `IDLE`, `LOADING`, `SUCCESS`, `ERROR`. Giao diện phải hiển thị skeleton trong lúc chờ, dữ liệu khi thành công, thông báo lỗi và nút thử lại khi thất bại. Kết quả của yêu cầu cũ không được ghi đè kết quả của yêu cầu mới.

- Thư mục bài làm và kho Git: `D:/homework/lab2/exercise3`.
- Thư mục ứng dụng: `app/`.
- Công nghệ: React, TypeScript, Vite, CSS và Oxlint.
- Thời lượng sprint theo đề: 35 phút; đây là giới hạn của đề, không phải thời gian thực hiện đã đo.
- Ngày cập nhật: 10/10/2026.
- Nguồn dữ liệu hiện tại: hàm `fetchFeed()` giả lập độ trễ 1,5 giây và trả về hai dự án.

## 2. Phân rã công việc

| Mã WBS | Công việc | Sản phẩm / tiêu chí hoàn thành | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| 1.1 | Khởi tạo kho Git | Có kho Git riêng cho Exercise 3 | — | Hoàn thành |
| 1.2 | Tạo dự án React + TypeScript | Dự án Vite trong `app/`, đã cài thư viện | 1.1 | Hoàn thành |
| 1.3 | Kết nối component vào ứng dụng | `App.tsx` hiển thị `FeedView`; các file của component nằm trong `app/src` | 1.2 | Hoàn thành |
| 2.1 | Định nghĩa kiểu trạng thái | `ViewState<T>` chỉ cho phép bốn trạng thái; `SUCCESS` có `data`, `ERROR` có `error` | 1.2 | Hoàn thành |
| 2.2 | Khởi tạo state của component | Dùng `useState<ViewState<FeedItem[]>>`, trạng thái ban đầu là `IDLE` | 2.1 | Hoàn thành |
| 3.1 | Tạo nguồn dữ liệu giả lập | `fetchFeed()` trả về `Project Alpha` và `Project Beta` sau 1,5 giây | 2.2 | Hoàn thành |
| 3.2 | Triển khai hàm tải dữ liệu | `loadData()` chuyển sang `LOADING` trước khi chờ kết quả | 3.1 | Hoàn thành |
| 3.3 | Xử lý tải thành công và thất bại | `try/catch` chuyển state sang `SUCCESS` hoặc `ERROR` với thông báo dễ hiểu | 3.2 | Hoàn thành |
| 3.4 | Ngăn kết quả cũ cập nhật giao diện | Mỗi lần tải tăng `requestId`; chỉ yêu cầu mới nhất được cập nhật state, kể cả khi có lỗi | 3.3 | Hoàn thành |
| 3.5 | Xử lý khi component bị gỡ | Cleanup của `useEffect` tăng `requestId` để vô hiệu hóa kết quả đang chờ | 3.4 | Hoàn thành |
| 4.1 | Hiển thị skeleton trong lúc tải | Ba khối placeholder chỉ xuất hiện khi state là `LOADING` | 3.2 | Hoàn thành |
| 4.2 | Tạo hiệu ứng skeleton bằng CSS | Animation `pulse` thay đổi độ trong suốt; tắt animation khi người dùng chọn giảm chuyển động | 4.1 | Hoàn thành |
| 4.3 | Hiển thị dữ liệu thành công | Render danh sách từ `state.data` với `key` theo `id` | 3.3 | Hoàn thành |
| 4.4 | Hiển thị lỗi và nút thử lại | Thông báo có `role="alert"`; nút mang nhãn `Retry Connection` khi có lỗi và gọi lại `loadData()` | 3.3 | Hoàn thành |
| 4.5 | Khóa nút trong lúc tải | Nút bị vô hiệu hóa khi state là `LOADING` | 3.2 | Hoàn thành |
| 5.1 | Kiểm tra tải thành công và skeleton | Người làm bài đã quan sát skeleton, sau đó thấy `SUCCESS` và danh sách dữ liệu | 4.1–4.3 | Hoàn thành |
| 5.2 | Kiểm tra lỗi và thử lại | Bật lỗi giả lập một lần; người làm bài xác nhận đã thấy lỗi và kiểm tra bước thử lại | 4.4 | Hoàn thành |
| 5.3 | Kiểm tra cơ chế chống kết quả cũ | Đối chiếu mã: cả nhánh thành công và nhánh lỗi đều kiểm tra `requestId`; cleanup vô hiệu hóa yêu cầu đang chờ | 3.4, 3.5 | Hoàn thành qua mã nguồn |
| 5.4 | Kiểm tra TypeScript và build | `npm run build` kết thúc thành công | 4.1–4.5 | Hoàn thành |
| 5.5 | Kiểm tra mã bằng Oxlint | `npm run lint` kết thúc thành công | 4.1–4.5 | Hoàn thành |
| 6.1 | Lưu commit theo yêu cầu đề | Có commit chức năng với thông điệp bắt buộc | 5.1–5.5 | Hoàn thành |
| 6.2 | Lập tài liệu WBS | Có file `WBS.md` mô tả công việc, trạng thái, kiểm tra và bàn giao | 6.1 | Hoàn thành |

## 3. Các trạng thái và luồng chuyển đổi

| Trạng thái | Ý nghĩa | Giao diện |
|---|---|---|
| `IDLE` | Chưa bắt đầu tải | Hiển thị trạng thái và nút `Tải dữ liệu` |
| `LOADING` | Đang chờ kết quả | Skeleton nhấp nháy, thông báo đang tải và nút bị khóa |
| `SUCCESS` | Tải thành công | Danh sách dữ liệu và nút tải lại |
| `ERROR` | Tải thất bại | Thông báo lỗi và nút `Retry Connection` |

```text
IDLE → LOADING → SUCCESS
IDLE → LOADING → ERROR
ERROR → LOADING → SUCCESS hoặc ERROR
SUCCESS → LOADING → SUCCESS hoặc ERROR
```

Việc tải bắt đầu khi người dùng nhấn nút. Khi bắt đầu lần tải mới, state được thay hoàn toàn bằng `{ status: 'LOADING' }`, nên dữ liệu hoặc thông báo lỗi của lần trước không tiếp tục hiển thị.

## 4. Cơ chế xử lý yêu cầu bất đồng bộ

1. `requestId` được lưu bằng `useRef` trong component.
2. Mỗi lần gọi `loadData()`, tăng `requestId` và lưu số đó vào `currentRequest`.
3. Sau khi tải thành công hoặc gặp lỗi, so sánh `currentRequest` với `requestId.current`.
4. Nếu hai giá trị khác nhau, bỏ qua kết quả vì yêu cầu đã hết hiệu lực.
5. Khi component bị gỡ, cleanup tăng `requestId` để kết quả đang chờ không cập nhật state.

Cơ chế này bỏ qua kết quả cũ; nó không hủy tác vụ tải đang chạy. Nút bị khóa trong `LOADING` giúp tránh các lần tải trùng do người dùng bấm liên tục.

## 5. Kết quả kiểm tra và giới hạn

| Nội dung | Phương pháp / bằng chứng | Kết quả |
|---|---|---|
| Khởi tạo | Ảnh kết quả người làm bài cung cấp | Hiển thị `IDLE` |
| Tải thành công | Ảnh kết quả người làm bài cung cấp | Hiển thị `SUCCESS`, `Project Alpha` và `Project Beta` |
| Skeleton | Người làm bài xác nhận đã quan sát trên trình duyệt | Xuất hiện trong lúc chờ tải |
| Lỗi và thử lại | Dùng `simulateErrorOnce = true`; người làm bài xác nhận sau bước kiểm tra | Đã kiểm tra luồng lỗi và thử lại |
| Chống kết quả cũ | Đối chiếu mã nguồn | Có kiểm tra số thứ tự ở cả nhánh thành công và lỗi |
| Component bị gỡ | Đối chiếu cleanup trong mã nguồn | Có vô hiệu hóa yêu cầu đang chờ |
| TypeScript và build | Chạy `npm run build` | Thành công, mã thoát 0 |
| Kiểm tra mã | Chạy `npm run lint` | Thành công, mã thoát 0 |
| Mốc Git | Đọc lịch sử Git | Có commit bắt buộc `a5b14ca` |

Chưa thực hiện thử nghiệm riêng với hai yêu cầu trả về sai thứ tự hoặc thao tác gỡ component trong lúc tải; hai cơ chế này đã được kiểm tra qua mã nguồn. Không coi kết quả build và lint là bằng chứng kiểm thử các tình huống chạy đó.

`simulateErrorOnce` hiện được đặt là `false` để tải thành công bình thường. Có thể đổi thành `true` và tải lại trang để trình diễn lần tải đầu thất bại, sau đó thử lại thành công. Bài hiện dùng dữ liệu giả lập, chưa kết nối API thật.

## 6. Mốc Git

| Mốc | Commit | Thông điệp |
|---|---|---|
| Hoàn thành component nhiều trạng thái và skeleton | `a5b14ca` | `feat(ui): implement multi-state data component with skeleton feedback` |

Commit này đã tồn tại trước khi tạo `WBS.md`. Tài liệu WBS được bổ sung sau và cần được lưu trong commit riêng nếu muốn đưa vào lịch sử Git.

## 7. Các file bàn giao

| File | Vai trò |
|---|---|
| `app/src/state-machine.ts` | Định nghĩa kiểu `ViewState<T>` |
| `app/src/FeedView.tsx` | Dữ liệu giả lập, state, hàm tải, kiểm tra yêu cầu cũ và giao diện |
| `app/src/skeleton.css` | Bố cục skeleton, animation pulse và hỗ trợ giảm chuyển động |
| `app/src/App.tsx` | Kết nối `FeedView` vào ứng dụng |
| `app/src/main.tsx` | Khởi động React và render `App` |
| `app/src/index.css` | Kiểu giao diện chung |
| `app/index.html` | Trang HTML chứa root của ứng dụng |
| `app/package.json` | Thư viện và lệnh chạy, build, lint |
| `app/package-lock.json` | Khóa phiên bản thư viện |
| `app/tsconfig.app.json` | Cấu hình TypeScript cho component React |
| `app/vite.config.ts` | Cấu hình Vite |
| `WBS.md` | Phân rã công việc và ghi nhận kết quả |

## 8. Cách chạy và kiểm tra

Mở terminal tại thư mục ứng dụng:

```powershell
cd D:\homework\lab2\exercise3\app
npm install
npm run dev
```

Mở địa chỉ local mà terminal hiển thị, rồi nhấn `Tải dữ liệu` để kiểm tra. Nếu thư viện đã được cài, có thể bỏ qua `npm install`.

Kiểm tra TypeScript, tạo bản build và kiểm tra mã:

```powershell
npm run build
npm run lint
```
