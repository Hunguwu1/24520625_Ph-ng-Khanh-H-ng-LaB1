# Quy tắc dự án — Homework 2 Piano

## Phạm vi và dữ liệu

- Giữ đủ 88 phím A0–C8, 52 trắng/36 đen; A4 = 440 Hz.
- Tối đa 8 voice đang giữ, thay voice cũ nhất theo FIFO; giải thích riêng đuôi release 40 ms.
- Bản ghi giữ đúng thứ tự nhấn, delta, duration và nốt chồng nhau; hỗ trợ 0.5×, 1×, 2×.
- Không thay đổi yêu cầu hoặc xóa tính năng để làm kiểm thử đạt.

## React và chất lượng mã

- Dùng function components, Hooks, createRoot và event.key. Không dùng Class components, ReactDOM.render, defaultProps, keyCode hoặc alert(). Các class nghiệp vụ âm thanh được phép.
- Không sửa trực tiếp state React; sao chép Set và snapshot bản ghi trước khi đưa vào state.
- Giữ callback ổn định, props từng phím đơn giản và React.memo cho PianoKey.
- Tách bộ tổng hợp âm, bộ ghi và hàng đợi phát khỏi giao diện; xử lý lỗi và dọn listener, timer, audio node khi kết thúc.

## Responsive và accessibility

- Không cuộn ngang toàn trang hoặc vùng con ở 375px; không che lỗi bằng overflow-x: hidden.
- Giữ đủ 88 phím bằng các nhóm quãng tám xuống hàng; bảng ghi phải tự xuống dòng.
- Dùng HTML đúng ngữ nghĩa. Chỉ dùng div khi cần nhóm bố cục.
- Form controls có label htmlFor và id sinh từ useId; button có tên truy cập.
- Khai báo lang="vi"; hỗ trợ Tab, Space, Enter, focus rõ và nhấn/thả nhiều nguồn không tắt nốt sớm.
- Mục tiêu Lighthouse Accessibility 100; phân biệt kết quả tự động với kiểm tra WCAG thủ công.

## Bảo mật

- Hiển thị dữ liệu bằng JSX dạng text. Không dùng dangerouslySetInnerHTML, innerHTML, document.write, eval hoặc new Function để xử lý dữ liệu.
- Không thực thi dữ liệu từ URL, storage hoặc nguồn ngoài; kiểm tra dữ liệu nốt trước khi phát lại.
- Không đưa token, mật khẩu, node_modules hoặc dist vào Git.

## Kiểm chứng và sử dụng AI

- Đọc và kiểm tra mã AI đề xuất; không xem lời giải thích của AI là bằng chứng chạy thật.
- Audit phải nêu bản trước/sau, bước tái hiện, mong đợi/thực tế, nguyên nhân, cách sửa và kết quả kiểm tra có thể chạy lại.
- Không bịa lỗi, prompt, ảnh hoặc log; không cài lỗi vào bản trước để tạo minh chứng. Nếu không có bằng chứng nguồn gốc AI, nói rõ giới hạn đó.
- Chạy unit tests, build, lint sau thay đổi chức năng; dùng kiểm tra trình duyệt cho lỗi tương tác và bố cục.
- Mỗi commit có một mục đích rõ; kiểm tra phần đã stage; chỉ commit trong lab3/homework2 và không gom thay đổi của bài khác.
- Không viết lại lịch sử, đổi ngày commit hoặc chia commit giả để đủ số lượng. Các quy tắc này được bổ sung ngày 08/11/2026, không tuyên bố đã có từ đầu dự án.
