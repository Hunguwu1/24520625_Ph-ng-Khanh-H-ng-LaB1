# Task Decomposition — Lab 3 HW 1: Production Studio Drum Kit

Ngày cập nhật: 08/11/2026. Kết quả kiểm thử chính được ghi nhận ngày 06/11/2026; build/lint được chạy lại trước khi publish ngày 08/11/2026.

Tài liệu phân rã nhiệm vụ theo đầu vào, bước thực hiện, đầu ra, phụ thuộc và tiêu chí kiểm tra. Cấu trúc công việc tổng thể nằm trong [WBS.md](./WBS.md). Trạng thái dưới đây phản ánh mã nguồn và bằng chứng hiện có, không phải chứng nhận WCAG.

## T-01 — Khảo sát và khởi tạo

- **WBS:** 1.1–1.2.
- **Mục tiêu:** tạo dự án mới dựa trên chức năng Drum Kit cũ và kỹ thuật hỗ trợ tiếp cận của Lab 2.
- **Đầu vào:** ảnh đề bài, Drum Kit Lab 1 và DataGrid Lab 2 HW 1.
- **Thực hiện:** khảo sát hai bài; xác định phạm vi; tạo React + TypeScript bằng Vite; cài dependencies; cấu hình CSS và các lệnh phát triển.
- **Đầu ra:** dự án có `src/main.tsx`, `src/App.tsx`, `package.json`, các cấu hình Vite/TypeScript.
- **Kiểm tra:** `npm run dev` mở được ứng dụng; không đưa logic điều hướng bảng nhân viên vào vùng pad.
- **Phụ thuộc:** không có.
- **Trạng thái:** hoàn thành.

## T-02 — Định nghĩa dữ liệu và chuẩn bị âm thanh

- **WBS:** 2.1–2.2.
- **Mục tiêu:** dùng một cấu trúc dữ liệu thống nhất để tạo nút và ánh xạ phím.
- **Hợp đồng:** `DrumPad` gồm `id`, `name`, `key`, `code`, `src`; id và code duy nhất; src trỏ đến file thật trong `public/sounds`.
- **Thực hiện:** giữ ba WAV cũ; bổ sung bốn MP3; ghi nguồn và nội dung attribution; tạo Map theo code ở ngoài component.

| Phím | event.code | Pad | File |
|---|---|---|---|
| W | KeyW | Tom 1 | `/sounds/tom1.mp3` |
| A | KeyA | Kick | `/sounds/kick.wav` |
| S | KeyS | Snare | `/sounds/snare.wav` |
| D | KeyD | Hi-hat | `/sounds/hihat.wav` |
| J | KeyJ | Tom 2 | `/sounds/tom2.mp3` |
| K | KeyK | Crash | `/sounds/crash.mp3` |
| L | KeyL | Ride | `/sounds/ride.mp3` |

- **Đầu ra:** kiểu dữ liệu trong `useDrumKeyboard.ts`, mảng pads trong `App.tsx`, bảy file âm thanh, `CREDITS.md`, `UPSTREAM-README.md`.
- **Kiểm tra:** bảy file tải và giải mã được; thời lượng lớn hơn 0; giữ đúng đuôi WAV/MP3.
- **Phụ thuộc:** T-01.
- **Trạng thái:** đủ bảy âm thanh; `CREDITS.md` và `UPSTREAM-README.md` đã được bổ sung lại ngày 08/11/2026. Nguồn của các WAV cũ không được xác lập lại trong tài liệu này.

## T-03 — Giao diện và thao tác bằng nút

- **WBS:** 2.3, một phần 6.1.
- **Mục tiêu:** thao tác trực tiếp được bằng chuột, Tab, Enter và Space.
- **Thực hiện:** render pads bằng map; dùng `button type="button"`; hiển thị tên và phím; gọi chung `triggerPad(pad)`; đặt heading và nhãn cho các vùng giao diện.
- **Đầu ra:** giao diện trong `App.tsx` và CSS.
- **Kiểm tra:** đủ bảy pad; mỗi nút có tên truy cập lấy từ nội dung; không cần tự viết lại hành vi Enter/Space của button.
- **Phụ thuộc:** T-02.
- **Trạng thái:** hoàn thành.

## T-04 — Hook bàn phím và cách ly nhập liệu

- **WBS:** 3.1–3.4.
- **Mục tiêu:** dùng phím vật lý và tránh đánh trống ngoài ý muốn.
- **Hợp đồng:** `useDrumKeyboard(padMap, onTriggerPad, isEnabled)` đăng ký keydown khi bật, gọi callback bằng pad tìm được và gỡ listener khi cleanup.
- **Thực hiện theo thứ tự:**
  1. Bỏ qua `event.repeat` và tổ hợp Ctrl/Alt/Meta.
  2. Bỏ qua target trong input, textarea, select hoặc vùng contenteditable.
  3. Tra pad bằng `event.code`.
  4. Chỉ preventDefault khi có pad phù hợp.
  5. Gọi callback kích hoạt; cung cấp công tắc bật/tắt và aria-keyshortcuts tương ứng.
- **Đầu ra:** `src/useDrumKeyboard.ts`, state công tắc và ô ghi chú trong `App.tsx`.
- **Kiểm tra:** bảy phím đúng; giữ phím không lặp; nhập liệu không kích hoạt; khi tắt phím tắt, nút vẫn dùng được.
- **Phụ thuộc:** T-02, T-03.
- **Trạng thái:** đã qua kiểm tra tự động; thử UniKey trực tiếp thuộc T-12.

## T-05 — Engine âm thanh và cache

- **WBS:** 4.1–4.3.
- **Mục tiêu:** phát tín hiệu dùng chung cho loa và meter, hỗ trợ âm thanh chồng nhau.
- **Hợp đồng:** `useDrumAudio()` trả về `playSound(src)`, `levelDb`, `audioError`. `playSound` xử lý lỗi nội bộ; không trả boolean như engine của bài cũ.
- **Thực hiện:** tạo AudioContext khi tương tác; resume; fetch và decodeAudioData; cache Promise theo src; tạo AudioBufferSourceNode riêng mỗi lần; kết nối source → analyser → destination.
- **Xử lý vòng đời:** xóa cache entry khi giải mã thất bại để thử lại; bỏ qua kết quả tải nếu engine đã đổi; disconnect source khi kết thúc; đóng context và hủy interval khi cleanup.
- **Đầu ra:** `src/useDrumAudio.ts`; App gọi `void playSound(pad.src)`.
- **Kiểm tra:** các file giải mã được, meter nhận tín hiệu, không có lỗi console trong luồng thành công.
- **Phụ thuộc:** T-02, T-03.
- **Trạng thái:** hoàn thành triển khai; chưa kiểm tra riêng mọi nhánh lỗi hoặc nghe trực tiếp chất lượng chồng âm.

## T-06 — Trạng thái pad và phản hồi trực quan

- **WBS:** 5.1.
- **Mục tiêu:** nhận biết pad vừa được kích hoạt bằng hình ảnh.
- **Thực hiện:** lưu activePads; thêm id khi đánh; cập nhật aria-pressed; dùng CSS chọn trạng thái true; đặt timer 150 ms riêng từng pad; hủy timer cũ nếu đánh lại; dọn timer khi unmount.
- **Đầu ra:** state, ref timer và triggerPad trong `App.tsx`; CSS trạng thái trong `App.css`.
- **Kiểm tra:** pad bật rồi tắt; một pad không tắt trạng thái pad khác; đánh lại cùng pad tính lại thời gian hiệu ứng.
- **Phụ thuộc:** T-03, T-04.
- **Trạng thái:** đã triển khai; kiểm tra tự động xác nhận bật/tắt cơ bản.

## T-07 — Lịch sử và live output

- **WBS:** 5.2.
- **Mục tiêu:** cung cấp lịch sử bằng chữ và thông báo cập nhật cho công nghệ hỗ trợ.
- **Thực hiện:** tăng bộ đếm; lưu id và name cho mỗi lần đánh; đưa lần mới lên đầu; slice giữ mười mục; output hiển thị lần mới nhất với aria-live polite và aria-atomic true.
- **Đầu ra:** output và danh sách lịch sử trong `App.tsx`.
- **Kiểm tra:** mười mục mới nhất theo thứ tự; đánh cùng pad vẫn tăng số; gõ vào ghi chú không thay đổi lịch sử.
- **Phụ thuộc:** T-06.
- **Trạng thái:** cập nhật dữ liệu đã qua kiểm tra; cách NVDA thông báo thực tế còn chờ T-12.

## T-08 — Meter mức tín hiệu thực

- **WBS:** 5.3.
- **Mục tiêu:** hiển thị cường độ tín hiệu được phát, không dùng giá trị giả lập.
- **Thực hiện:** đọc dữ liệu thời gian từ analyser mỗi 50 ms; tính RMS; đổi sang dBFS bằng `20 * log10(RMS)`; giới hạn từ -60 đến 0; cập nhật meter và dòng số.
- **Đầu ra:** levelDb trong hook, meter có nhãn và mô tả trong App.
- **Quy ước:** -60 là sàn hiển thị; không phải đo độ ồn môi trường; các mức trên 0 bị giới hạn ở 0. Khi context không chạy, đưa meter về sàn.
- **Kiểm tra:** phát Crash làm meter vượt -60; hết tín hiệu trở lại -60; không thêm aria-live cho giá trị thay đổi liên tục.
- **Phụ thuộc:** T-05.
- **Trạng thái:** hoàn thành và đã qua kiểm tra tự động.

## T-09 — Focus, màu, bố cục và metadata

- **WBS:** 6.1–6.4.
- **Mục tiêu:** giao diện rõ, điều hướng được và thông tin trang đúng.
- **Thực hiện:** viền focus pad/input/link; màu link đủ rõ trên nền tối; flex-wrap cho pad; meter co theo chiều rộng; lang vi; title và description phù hợp; robots.txt hợp lệ.
- **Đầu ra:** `App.css`, `index.css`, `index.html`, `public/robots.txt`.
- **Kiểm tra:** Tab/Shift+Tab, Enter/Space và rời vùng pad; axe contrast; không tràn ngang ở 320/390/640 px; xem ảnh desktop/mobile.
- **Phụ thuộc:** T-03, T-06–T-08.
- **Trạng thái:** hoàn thành trong phạm vi tự động và xem ảnh; zoom thật chưa thử.

## T-10 — Kiểm thử chức năng và lưu ảnh

- **WBS:** 7.1–7.2, một phần 8.1.
- **Mục tiêu:** có kiểm tra lặp lại được cho chức năng quan trọng.
- **Thực hiện:** chạy bản production trên preview; dùng Playwright với Chrome; giải mã các file; thử phím, repeat, nhập liệu, công tắc, pad, lịch sử, meter và focus; ghi nhận lỗi console; chạy axe; chụp ảnh ba chiều rộng.
- **Đầu ra:** `artifacts/tools/check-app.mjs`, JSON kết quả và ảnh trong artifacts.
- **Kiểm tra:** tất cả nhóm có passed true; không có pageerror hoặc lỗi audio trong luồng thành công.
- **Phụ thuộc:** T-04–T-09.
- **Trạng thái:** đạt ngày 06/11/2026. Mô phỏng key/code không được ghi là thử UniKey thật.

## T-11 — Build, lint và Lighthouse

- **WBS:** 7.3–7.4.
- **Mục tiêu:** xác nhận ứng dụng build được, mã không có lỗi lint và lưu phép đo Lighthouse.
- **Thực hiện:** chạy build và lint; chạy Lighthouse mobile trên preview; sửa lỗi phát hiện; đo lại sau khi sửa; giữ báo cáo của bản cuối.
- **Đầu ra:** `artifacts/tools/run-lighthouse.mjs`, `lighthouse-report.html`, `lighthouse-report.json`.
- **Kết quả hiện có:** Performance 100, Accessibility 100, Best Practices 100, SEO 100; build/lint thành công.
- **Phụ thuộc:** T-09, T-10.
- **Trạng thái:** đạt ngày 06/11/2026; vẫn có khuyến nghị hiệu năng trong báo cáo gốc.

## T-12 — Kiểm thử thủ công và đối chiếu WCAG

- **WBS:** 7.5–7.8, 8.3.
- **Mục tiêu:** bổ sung kiểm tra mà Lighthouse và mô phỏng chưa xác nhận được.
- **Phụ thuộc:** T-10, T-11.
- **Trạng thái:** chưa thực hiện trực tiếp.

| Nhóm | Thực hiện | Kết quả mong đợi | Bằng chứng dự kiến |
|---|---|---|---|
| UniKey | Bật tiếng Việt/Telex; đánh bảy phím khi ngoài ô nhập; gõ tiếng Việt trong ghi chú; tắt phím tắt | Mã phím vẫn chọn đúng pad; gõ ghi chú không phát tiếng | `artifacts/unikey-test.mp4` và biên bản |
| NVDA | Tab qua công tắc, pad, ghi chú và link; Enter/Space; đánh một lần rồi chờ live output | Tên và trạng thái rõ; thao tác được; cập nhật lịch sử có thông báo phù hợp | `artifacts/nvda-speech-viewer.png` và biên bản |
| Phím tắt với NVDA | Thử trong chế độ tương tác, phân biệt phím chữ do chế độ duyệt sử dụng | Không nhầm điều hướng NVDA với lỗi phím tắt của ứng dụng | Ghi chế độ NVDA trong biên bản |
| Zoom 200% thật | Đổi zoom trong trình duyệt, dùng hết các chức năng và quan sát focus | Không mất nội dung hoặc điều khiển, không chồng chữ | `artifacts/zoom-200-percent.png` |
| Nghe trực tiếp | Nghe từng pad; đánh nhanh cùng pad và nhiều pad | Đúng tiếng, hoạt động chồng âm, không bị ngắt bất thường | Ghi kết quả và thiết bị nghe |
| WCAG A/AA | Lập danh sách toàn bộ tiêu chí áp dụng; đánh giá trang và trạng thái; nêu lý do cho mục không áp dụng | Mỗi tiêu chí có kết quả, bằng chứng hoặc lỗi cần sửa | Bảng đánh giá WCAG trong báo cáo thủ công |

Các tên file ở bảng này là kế hoạch, chưa phải bằng chứng đã có. Ghi môi trường, phiên bản công cụ, thao tác, mong đợi và kết quả thực tế vào `artifacts/manual-test-results.md` sau khi thử. Nếu có lỗi, sửa và kiểm tra lại phần bị ảnh hưởng.

## T-13 — Tổng hợp tài liệu và bàn giao

- **WBS:** 8.1–8.3.
- **Mục tiêu:** người nhận bài hiểu cách chạy, chức năng, kết quả và phần chưa xác nhận.
- **Thực hiện:** lưu báo cáo/ảnh; lập WBS và task decomposition; dẫn tới credits; cập nhật trạng thái sau kiểm thử thủ công.
- **Đầu ra hiện có:** README.md, WBS.md, TASK_DECOMPOSITION.md, artifacts/verification.md, các JSON/HTML/PNG và hai file credits âm thanh trong `public/sounds`.
- **Điều kiện đóng:** bằng chứng khớp mã nguồn cuối; không đánh dấu thử thủ công đã đạt trước khi thực hiện; nếu tuyên bố WCAG 2.2 AA thì phải có đánh giá đầy đủ tiêu chí áp dụng.
- **Phụ thuộc:** T-11; hoàn tất nghiệm thu đầy đủ phụ thuộc thêm T-12.
- **Trạng thái:** hoàn thành tài liệu, thông tin nguồn và bằng chứng tự động; chờ bổ sung kết quả thủ công.

## Luồng phụ thuộc

```text
T-01 → T-02 → T-03 → T-04
                  ├→ T-05 → T-08
                  └→ T-06 → T-07
T-03 đến T-08 → T-09 → T-10 → T-11 → T-12 → chốt T-13
```

Các bước trên mô tả thứ tự logic, không phải xác nhận công việc được làm song song hay thời gian đã sử dụng.

## T-14 — Verified AI failure audit and commit delivery

- Preserve baseline commit 067e2d3; reproduce faults against its real App and keyboard hook before applying corrections.
- Verify three cases: explicit labels and useId contract, IME composition isolation, and held Enter on a focused pad.
- Correct each concern independently; run the same regression assertions against the final application.
- Save baseline and final JSON evidence, exact commands, root causes and limitations in AI_FAILURE_AUDIT.md.
- Deliver at least eight focused follow-up commits on codex/drumkit-verified-audit. These are present-day improvements, not a reconstruction of the original implementation history.
- Run build, lint, functional browser checks and Lighthouse after the final code changes.
