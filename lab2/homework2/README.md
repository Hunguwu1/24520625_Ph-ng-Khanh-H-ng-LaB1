# FIFO Audio Visualizer

Ứng dụng web phát các bài nhạc theo thứ tự được thêm vào hàng đợi (FIFO), đồng thời tải và giải mã tối đa hai bài. Khi phát, ứng dụng vẽ phổ tần số âm thanh trên Canvas bằng Web Audio API.

## Yêu cầu

- Node.js và npm (dự án đã chạy với Node.js 24).
- Trình duyệt hỗ trợ Web Audio API và Canvas, chẳng hạn Chrome.

## Cài đặt và chạy

Mở terminal tại thư mục `homework2`, rồi chạy:

```bash
npm install
npm run dev
```

Mở địa chỉ mà Vite in ra trong terminal, thường là `http://localhost:5173/`. Nếu cổng 5173 đang được dùng, Vite sẽ chọn cổng khác; hãy dùng đúng địa chỉ được in ra.

Dự án có sẵn bài mẫu ở `public/audio/test.mp3`. Để thêm bài đó, nhập URL sau vào ô **Đường dẫn bài nhạc** (thay cổng nếu Vite dùng cổng khác):

```text
http://localhost:5173/audio/test.mp3
```

Để thêm bài khác, đặt file âm thanh vào `public/audio/`, rồi dùng URL có dạng `http://localhost:5173/audio/ten-file.mp3`. Có thể dùng URL từ nơi khác nếu máy chủ cho phép trình duyệt tải file qua CORS.

## Sử dụng

1. Nhập URL bài nhạc và bấm **Thêm vào hàng đợi**. Lặp lại để thêm nhiều bài.
2. Bấm **Phát**. Nếu bài đầu chưa tải xong, ứng dụng sẽ chờ bài đó; bài phía sau dù sẵn sàng trước cũng không phát vượt hàng.
3. Bấm **Dừng** để dừng bài đang phát. Bấm **Phát** lần nữa để phát lại bài đó từ đầu.
4. Bấm **Hủy** ở bài đang chờ hoặc đang tải để bỏ bài đó.
5. Bấm **Xóa hàng đợi** để dừng phát, hủy các tác vụ và xóa danh sách.

Mỗi bài hiển thị một trạng thái: đang chờ, đang tải, sẵn sàng, đang phát, hoàn tất, đã hủy hoặc lỗi. Trình duyệt yêu cầu thao tác của người dùng trước khi phát âm thanh, vì vậy hãy bấm **Phát** trên trang.

## Cách hoạt động

- `AudioTaskQueue` lấy tác vụ từ đầu hàng đợi và giới hạn ở **2 tác vụ tải/giải mã đồng thời**. Nếu một tác vụ lỗi hoặc bị hủy, tác vụ tiếp theo vẫn có thể bắt đầu.
- `AudioEngine` lưu thứ tự các bài và trạng thái phát. Nó chỉ chọn bài sẵn sàng đầu tiên còn hợp lệ để phát; bài hoàn tất, lỗi hoặc đã hủy được bỏ qua.
- `AudioPlayer` tạo `AudioBufferSourceNode` mới cho mỗi lần phát. Khi dừng hoặc kết thúc, nó ngắt kết nối và bỏ tham chiếu đến source.
- `Visualizer` dùng `AnalyserNode` với `fftSize = 512`, tạo **256 dải tần**, và vẽ Canvas bằng `requestAnimationFrame`. Vòng vẽ được dừng khi nhạc dừng hoặc kết thúc.
- Mỗi bài có `AbortController` để hủy yêu cầu tải. `decodeAudioData()` không nhận `AbortSignal`, nên nếu việc giải mã đã bắt đầu, kết quả của bài bị hủy sẽ bị bỏ qua sau khi giải mã xong. Khi xóa hàng đợi hoặc rời trang, ứng dụng cũng dọn source, vòng vẽ và `AudioContext`.

## Cấu trúc mã nguồn

| File | Vai trò |
| --- | --- |
| `src/main.ts` | Khởi tạo giao diện và audio engine; dọn tài nguyên khi rời trang. |
| `src/audio-engine.ts` | Điều phối hàng đợi, trạng thái và thứ tự phát. |
| `src/audio-queue-controller.ts` | Tải, giải mã, hủy tác vụ và giới hạn số tác vụ đồng thời. |
| `src/audio-player.ts` | Phát âm thanh và quản lý `AudioBufferSourceNode`. |
| `src/visualizer.ts` | Phân tích tần số và vẽ phổ âm thanh. |
| `src/queue-view.ts` | Hiển thị danh sách và xử lý thao tác trên trang. |
| `src/audio-types.ts` | Các kiểu dữ liệu dùng chung. |
| `src/style.css` | Giao diện ứng dụng. |

## Kiểm tra

Kiểm tra biên dịch và tạo bản phát hành:

```bash
npm run build
```

Xem bản phát hành trên máy:

```bash
npm run preview
```

Hãy dùng địa chỉ mà lệnh `preview` in ra. Nếu dùng bài mẫu, URL của file cũng phải dùng **cùng cổng** với trang preview.

Các tình huống nên thử trong trình duyệt:

1. Thêm ba bài liên tiếp, bấm **Phát**, xác nhận thứ tự phát đúng thứ tự thêm vào kể cả khi bài sau tải xong trước.
2. Hủy một bài đang chờ hoặc đang tải; xác nhận bài đó không phát và bài tiếp theo vẫn xử lý.
3. Thêm một URL không tồn tại; xác nhận bài đó báo lỗi và các bài hợp lệ sau nó vẫn phát.
4. Dừng và phát lại; xác nhận không có hai bài phát chồng nhau.
5. Xóa hàng đợi trong lúc đang tải/phát, rồi thêm bài mới; xác nhận danh sách cũ không xuất hiện lại.

Mã dùng `requestAnimationFrame` để hướng tới mức hiển thị 60 FPS và có các bước dọn tài nguyên. **FPS thực tế và mức dùng bộ nhớ cần được đo trong trình duyệt trên máy chạy bài**; README này không khẳng định kết quả đo hay chứng minh không có rò rỉ bộ nhớ.
