# AI Failure Mode Audit — Homework 2 Piano

Ngày xác minh: 08/11/2026. Phạm vi: lab3/homework2.

## Phương pháp và nguồn gốc

Audit ba lỗi trong ứng dụng được rà soát và sửa với trợ giúp AI trong phiên làm việc hiện tại. Baseline là commit thật **dd2bc9258fdfb9d4c2832fbba95c2d49add96c86**, có trước các sửa đổi. Không chèn lỗi vào bản cũ để tạo minh chứng. Git không lưu đầy đủ prompt hoặc nguồn gốc từng dòng; không khẳng định đã chứng minh AI tạo ra cả ba lỗi lịch sử. Các failure mode là phân tích nguyên nhân bỏ sót, không phải prompt được trích từ hồ sơ.

`npm run audit:verify` xuất các tệp được track tại baseline vào thư mục tạm, phục vụ bản cũ và mã hiện tại qua hai máy chủ cục bộ, rồi so sánh trên cùng Chrome tại 375 × 812. Có assertion cho việc tái hiện lỗi trước và xác minh sửa sau; luôn kiểm tra đủ 88 phím. Không checkout/reset working tree.

Bằng chứng:

- [Mã xác minh](tests/verify-ai-audit.mjs)
- [JSON đo thực tế](reports/ai-audit/verification.json): thời gian UTC, phiên bản trình duyệt, baseline và commit mã sửa.
- [Ảnh trước](reports/ai-audit/before.png) và [ảnh sau](reports/ai-audit/after.png).
- [Lighthouse Accessibility 100/100](reports/lighthouse-375.report.html), không thay thế kiểm tra từng lỗi dưới đây.

## BUG-01 — Thả Enter tắt nốt trong khi vẫn giữ Space

**Loại:** tương tác bàn phím/state. **Mức độ:** trung bình.

**Vị trí:** src/components/PianoKey.jsx, onKeyDown/onKeyUp.

**Bước tái hiện:** focus C4 bằng Tab; giữ Space; nhấn Enter; thả Enter nhưng chưa thả Space.

**Mong đợi:** nốt và aria-pressed vẫn bật cho đến khi thả Space. **Thực tế bản cũ:** aria-pressed=false ngay khi thả Enter; JSON `before.pressedWhileSpaceHeld=false`.

**Nguyên nhân:** mỗi keyup đều gọi onNoteOff, không theo dõi các nguồn kích hoạt còn giữ. Failure mode: xử lý từng sự kiện độc lập, bỏ sót tổ hợp thao tác.

**Sửa:** dùng Set trong ref để giữ Space/Enter, chỉ tắt khi không còn phím kích hoạt hoặc pointer; xóa khi blur. Commit **189fd0e**.

**Sau sửa:** `after.pressedWhileSpaceHeld=true`, `after.releasedAfterBothUp=true`. Ảnh trước/sau chụp khi Space còn giữ, đối chiếu màu C4. Công cụ xác minh state giao diện, không đo dạng sóng âm thanh.

**Phòng ngừa:** kiểm tra các nguồn kích hoạt chồng nhau thay vì chỉ nhấn/thả từng nút riêng lẻ.

## BUG-02 — Bàn phím phải cuộn ngang ở 375px

**Loại:** không đáp ứng cách hiểu nghiêm ngặt của rubric “zero horizontal scroll”. **Mức độ:** trung bình.

**Vị trí:** src/App.css (.piano-scroll, .piano-keyboard), src/App.jsx.

**Bước tái hiện:** mở trang tại 375 × 812; đo clientWidth và scrollWidth của toàn trang và các vùng con.

**Mong đợi:** không có vùng cuộn ngang, vẫn truy cập đủ 88 phím. **Thực tế:** `.piano-scroll` có clientWidth=341px, scrollWidth=2288px. Chiều rộng toàn tài liệu vẫn là 375px; không báo nhầm đây là tràn toàn trang. Nếu người chấm cho phép cuộn riêng bàn phím, đây chỉ là khác biệt với cách hiểu rubric nghiêm ngặt được chọn cho bài.

**Nguyên nhân:** 52 phím trắng × 44px cùng overflow-x:auto. Failure mode: chọn bố cục dễ triển khai nhưng không đối chiếu ràng buộc đầu ra tại 375px.

**Sửa:** fieldset/legend theo quãng tám, CSS grid tự xuống hàng, tính rộng phím theo nhóm; bảng ghi fixed layout và wrap. Không giấu nội dung bằng overflow-x:hidden. Commit **578eb67**.

**Sau sửa:** `after.pageWidth=375`, `after.horizontalOverflow=[]`, `after.keyCount=88`. Xem ảnh toàn trang trước/sau.

**Phòng ngừa:** đo cả document và các vùng con; đếm đủ phím; kiểm tra thêm bảng ghi khi mở.

## BUG-03 — Trang tiếng Việt khai báo ngôn ngữ tiếng Anh

**Loại:** ngôn ngữ tài liệu không khớp nội dung, ảnh hưởng lựa chọn cách đọc của công nghệ hỗ trợ. **Mức độ:** trung bình.

**Vị trí:** index.html, thuộc tính lang của html.

**Bước tái hiện:** mở trang, đọc document.documentElement.lang, đối chiếu heading và hướng dẫn tiếng Việt.

**Mong đợi:** vi. **Thực tế bản cũ:** en; JSON `before.language=en`.

**Nguyên nhân:** giữ metadata từ mẫu khởi tạo khi đã thay nội dung. Failure mode: chỉ kiểm tra lang tồn tại, bỏ sót tính đúng của giá trị.

**Sửa:** lang="vi", đồng thời đặt title mô tả ứng dụng. Commit **1be8491**.

**Sau sửa:** `after.language=vi`, assertion đạt. Chưa thực hiện thử nghe bằng trình đọc màn hình thật.

**Phòng ngừa:** kiểm tra ngôn ngữ/title khi thay mẫu; không dùng điểm Lighthouse làm bằng chứng duy nhất cho độ đúng ngôn ngữ.

## Thay đổi liên quan

Ô chọn tốc độ trước đây có label bọc ngoài hợp lệ nhưng chưa đúng rubric htmlFor + useId(). Đã sửa trong 578eb67; JSON explicitLabels chuyển false → true. Không gọi đây là lỗi mất accessible name và không tính thành lỗi thứ tư.

Quy tắc mới trong [project-rules.md](project-rules.md), phân rã trong [TASK_DECOMPOSITION.md](TASK_DECOMPOSITION.md) và [WBS.md](WBS.md). Tài liệu được bổ sung sau rà soát, không ghi lùi thời gian. Lighthouse 100 không phải chứng nhận toàn bộ WCAG. Bằng chứng React Profiler vẫn chưa có trong thư mục bài.

## Atomic commits

Đối chiếu bằng `git log --oneline -- .` từ thư mục bài và `git show --stat <hash>`. Mỗi commit có một mục đích gắn với đầu ra; một tính năng có thể cần nhiều tệp và kiểm thử đi kèm.

| Commit | Mục đích |
| --- | --- |
| ed2f731 | Khởi tạo React + Vite |
| c79b42b | Sinh dữ liệu 88 phím |
| c9e8f39 | Bàn phím, âm thanh và FIFO |
| fb623f7 | Ghi nốt với thời gian/thời lượng |
| d6ab211 | Phát lại, tốc độ và hủy |
| d77b18e | Âm sắc và decay |
| dd2bc92 | WBS và task decomposition |
| 189fd0e | Sửa phím kích hoạt chồng nhau |
| 1be8491 | Sửa ngôn ngữ và title |
| 578eb67 | Responsive và nhãn tốc độ |
| c61d5d0 | Quy tắc dự án và xác minh AI |

Đã có trên 8 commit liên quan bài; không tạo commit rỗng hoặc viết lại lịch sử. Commit bổ sung audit chứa mã xác minh, kết quả và tài liệu; xem hash mới trong git log. Chỉ stage đường dẫn homework2; không gom thay đổi của bài khác.

## Chạy lại

```powershell
npm ci
npm test
npm run build
npm run lint
npm run audit:verify
```

Audit cần Git với baseline và Chrome/Edge; đặt CHROME_PATH nếu trình duyệt ở đường dẫn khác. Lệnh audit cập nhật ảnh/JSON, giữ baseline cố định và ghi HEAD hiện tại vào kết quả. Cần giữ lịch sử baseline khi chuyển repository.
