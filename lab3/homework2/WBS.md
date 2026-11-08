# WBS — HW2: 88-Key Polyphonic Piano & Concurrent FIFO Sequencer

Ngày cập nhật: 08/11/2026. Thư mục bài: `D:/homework/lab3/homework2`.

## 1. Mục tiêu và phạm vi

Xây dựng ứng dụng React gồm bàn phím piano A0–C8, phát đa âm, thay voice theo FIFO, ghi thao tác và phát lại bất đồng bộ có thể hủy. Chứng minh việc cô lập render của từng phím bằng React DevTools Profiler.

Hai thư mục Lab 2 được dùng làm tài liệu đối chiếu:

- `D:/homework/lab2/exercise2`: quản lý state và sự kiện bằng mini renderer. Bài này chưa có `React.memo` và thay toàn bộ DOM khi render; ứng dụng piano dùng React thật.
- `D:/homework/lab2/homework2`: hàng đợi tải/giải mã file âm thanh, Promise và hủy tác vụ. Bài piano vận dụng các nguyên tắc FIFO, hủy và dọn tài nguyên, đồng thời viết bộ phát nốt theo thời gian riêng.

## 2. Cấu trúc phân rã công việc

Trạng thái phản ánh mã nguồn và bằng chứng hiện có; không phải lịch sử thời gian thực hiện từng tác vụ.

| Mã WBS | Gói công việc | Sản phẩm / tiêu chí hoàn thành | Trạng thái |
| --- | --- | --- | --- |
| 1.0 | Khởi tạo dự án | React + Vite, cài thư viện, chạy được trang | Hoàn thành |
| 1.1 | Cấu hình môi trường | Có `package.json`, `vite.config.js`, điểm vào `main.jsx` | Hoàn thành |
| 1.2 | Thiết lập kiểm tra mã | Có lệnh `build`, `lint`; bộ kiểm tra dùng Node test runner | Hoàn thành |
| 2.0 | Sinh dữ liệu bàn phím | Đúng 88 nốt từ A0 đến C8, không viết cứng 88 thẻ | Hoàn thành |
| 2.1 | Tạo MIDI và tên nốt | Duyệt MIDI 21–108; tính tên nốt và quãng tám | Hoàn thành |
| 2.2 | Phân loại và tính tần số | 52 phím trắng, 36 phím đen; `440 * 2 ** ((midi - 69) / 12)` | Hoàn thành |
| 3.0 | Xây dựng giao diện | 88 component `PianoKey`, đúng vị trí phím trắng/đen | Hoàn thành |
| 3.1 | Bố trí bàn phím | Các quãng tám tự xuống hàng, có nhãn nốt, A0 đầu đàn và C8 cuối đàn | Hoàn thành |
| 3.2 | Xử lý thao tác | Pointer capture; nhấn/thả, cancel, mất capture; hỗ trợ Space/Enter | Hoàn thành |
| 3.3 | Hiển thị trạng thái | Màu nhấn theo state và `aria-pressed`; khóa phím trong lúc phát lại | Hoàn thành |
| 4.0 | Xây dựng bộ tổng hợp âm | `PolyphonicSynth`, Web Audio API, quản lý voice | Hoàn thành với lưu ý ở mục 6 |
| 4.1 | Tạo và tiếp tục AudioContext | Khởi tạo trong thao tác người dùng, xử lý context bị suspend | Hoàn thành |
| 4.2 | Bật/tắt nốt | Mỗi voice có một oscillator và gain; đặt đúng tần số | Hoàn thành |
| 4.3 | Giới hạn voice và FIFO | Map giữ tối đa 8 voice hoạt động; nốt thứ 9 thay nốt cũ nhất | Hoàn thành với đuôi giảm âm 40 ms |
| 4.4 | Tạo âm sắc | PeriodicWave dùng chung; lên âm nhanh, giảm dần khi giữ, release khi thả | Hoàn thành |
| 4.5 | Dọn tài nguyên | Ngắt node khi kết thúc; `stopAll()`; đóng context khi dispose | Hoàn thành triển khai và kiểm tra logic |
| 5.0 | Ghi thao tác chơi đàn | `NoteRecorder`, dữ liệu có thời gian và thứ tự | Hoàn thành |
| 5.1 | Ghi thời điểm nhấn | Dùng `performance.now()`, thêm nốt theo thứ tự nhấn, bỏ nhấn trùng | Hoàn thành |
| 5.2 | Chốt thời lượng | Khi thả, FIFO thay nốt, dừng âm hoặc kết thúc ghi | Hoàn thành |
| 5.3 | Điều khiển bản ghi | Bắt đầu, kết thúc, xóa; số nốt và bảng dữ liệu | Hoàn thành |
| 6.0 | Phát lại bất đồng bộ | `AudioTaskQueue`, giữ hợp âm và điều chỉnh tốc độ | Hoàn thành |
| 6.1 | Tạo lịch bật/tắt | Cộng dồn delta; sắp xếp sự kiện theo một mốc thời gian chung | Hoàn thành |
| 6.2 | Điều chỉnh tốc độ | Chia thời điểm bắt đầu và thời lượng cho 0.5, 1 hoặc 2 | Hoàn thành |
| 6.3 | Hủy lượt phát | AbortController, xóa timer, kết thúc Promise chờ, dừng voice | Hoàn thành |
| 6.4 | Bảo vệ lượt phát mới | Token sự kiện và mã phiên tránh lịch tắt cũ hoặc cleanup cũ tác động lượt mới | Hoàn thành |
| 7.0 | Cô lập render | Memo và callback ổn định; đo thực tế bằng Profiler | Hoàn thành cho kịch bản một phím |
| 7.1 | Tối ưu props | Truyền primitive props và `isPressed` riêng; `useCallback` ổn định | Hoàn thành |
| 7.2 | Thu bằng chứng Profiler | Nhấn/thả A0: mỗi commit chỉ App và một PianoKey render | Ghi nhận lịch sử; chưa có tệp xác minh trong hồ sơ hiện tại |
| 8.0 | Kiểm tra và tài liệu | Kiểm tra tự động, trình duyệt và hồ sơ bàn giao | Đã có bằng chứng; còn rà soát bàn giao |
| 8.1 | Kiểm tra tự động | 24/24 bài kiểm tra đạt; build và lint đạt | Hoàn thành tại lần kiểm tra gần nhất |
| 8.2 | Kiểm tra trình duyệt | Ghi/phát, 3 tốc độ, Stop, phát lại và chuyển tab | Đã kiểm tra |
| 8.3 | Lưu bằng chứng | Đã thu ảnh và JSON Profiler trong phiên kiểm tra; thư mục `evidence/` hiện không còn trong bản làm việc | Cần bổ sung lại nếu hồ sơ nộp yêu cầu |
| 8.4 | Lập WBS và phân rã tác vụ | `WBS.md`, `TASK_DECOMPOSITION.md` | Hoàn thành |
| 8.5 | Hoàn thiện hồ sơ nộp | README, quy tắc dự án, audit ba lỗi và hướng dẫn chạy lại | Đã cập nhật; Profiler còn thiếu |

## 3. Các sản phẩm bàn giao

| Thành phần | File / thư mục | Vai trò |
| --- | --- | --- |
| Dữ liệu nốt | `src/utils/generatePianoKeys.js` | Sinh 88 phím và tần số |
| Một phím | `src/components/PianoKey.jsx` | Memo, sự kiện và trạng thái hiển thị |
| Điều phối giao diện | `src/App.jsx` | State, callback, ghi/phát và vòng đời |
| Kiểu dáng | `src/App.css`, `src/index.css` | Bố trí đàn, phím và các điều khiển |
| Bộ tổng hợp âm | `src/audio/PolyphonicSynth.js` | Voice pool, âm sắc, FIFO và cleanup |
| Bộ ghi | `src/audio/NoteRecorder.js` | Thứ tự nhấn, delta và duration |
| Bộ phát lại | `src/audio/AudioTaskQueue.js` | Lịch sự kiện, tốc độ và hủy |
| Bộ kiểm tra | `tests/*.test.js` | Kiểm tra synth, recorder và queue |
| Bằng chứng | `reports/` | Audit trước/sau và Lighthouse; chưa có dữ liệu Profiler |
| Tài liệu | `WBS.md`, `TASK_DECOMPOSITION.md` | Phạm vi công việc và cách triển khai |

## 4. Các mốc Git thực tế

| Commit | Nội dung |
| --- | --- |
| `ed2f731` | Khởi tạo React piano project |
| `c79b42b` | Sinh dữ liệu 88 phím |
| `c9e8f39` | Giao diện, phát âm và FIFO voice stealing |
| `fb623f7` | Ghi nốt với thời gian và thời lượng |
| `d6ab211` | Phát lại, điều chỉnh tốc độ và hủy |
| `d77b18e` | Thêm hài và giảm âm tự nhiên cho âm piano tổng hợp |

Đây là các commit gốc đã có, không phải số mốc bắt buộc do đề quy định. Khi chuyển sang kho GitHub đích bằng cherry-pick, mã commit thay đổi nhưng thứ tự, tác giả và nội dung thay đổi được giữ; phần mô tả commit ghi mã nguồn gốc. Tài liệu được lưu trong commit riêng sau các mốc chức năng.

## 5. Kết quả xác minh

| Hạng mục | Phương pháp / bằng chứng | Kết quả |
| --- | --- | --- |
| Logic synth, recorder và queue | `node --test tests/*.test.js` | 24/24 đạt |
| Biên dịch | `npm run build` | Đạt |
| Kiểm tra mã | `npm run lint` | Đạt |
| Render một phím | Bản xuất Profiler đã phân tích trong phiên kiểm tra | 88 PianoKey trong cây; mỗi commit chỉ 1 PianoKey render |
| Nhấn A0 | Ảnh Profiler đã thu trong phiên kiểm tra | A0 0,3 ms; tổng commit 6,3 ms |
| Thả A0 | Ảnh Profiler đã thu trong phiên kiểm tra | A0 0,2 ms; tổng commit 6,6 ms |
| Phân tích bản xuất Profiler | Đối chiếu snapshot và danh sách fiber đã render | 87 phím khác không render trong cả hai commit |
| Chuyển tab khi phát | Kiểm tra thực tế trên Chrome | Quay lại ở trạng thái không phát; chờ thêm 13 giây không tự tiếp tục |

Các số đo Profiler trên được giữ như ghi nhận lịch sử từ tài liệu cũ, chưa được xác minh lại trong lần audit này. Chúng thuộc một lần nhấn/thả A0 trên máy kiểm tra, không đại diện mọi thao tác và mọi thiết bị. Các tệp bằng chứng đã thu không còn trong thư mục hiện tại và không được đính kèm bản đẩy lên GitHub này; cần đo/xuất lại nếu giảng viên yêu cầu minh chứng. Bài kiểm tra âm thanh tự động dùng AudioContext giả lập; người dùng đã xác nhận nghe được âm trầm, nhưng chưa có phép đo âm học hoặc đo rò rỉ bộ nhớ dài hạn.

## 6. Giới hạn và việc cần rà soát

- Giới hạn 8 áp dụng cho các voice hoạt động trong Map. Voice bị thay thế còn giảm âm 40 ms, nên số oscillator thực sự còn chạy có thể tạm thời lớn hơn 8. Nếu chấm theo giới hạn cứng 8 oscillator, cần điều chỉnh cơ chế thay voice.
- Âm hiện là piano tổng hợp bằng oscillator, không dùng mẫu âm đàn piano thật. Độ lớn vùng trầm phụ thuộc thiết bị phát.
- Bản ghi chỉ lưu trong bộ nhớ của phiên trang; tải lại sẽ mất. Chưa có lưu file bản ghi người chơi hoặc lưu vào cơ sở dữ liệu.
- Chuỗi phát dùng timer theo mốc chung; có thể bị trễ khi trình duyệt bận. Không khẳng định độ chính xác từng mẫu âm thanh.
- Rubric đã được cung cấp bổ sung: project-rules.md, TASK_DECOMPOSITION.md, ít nhất 6–8 atomic commits và AI_FAILURE_AUDIT.md với 3 lỗi được xác minh. Hồ sơ đã bổ sung theo phạm vi đó; cách đóng gói/nộp cuối cùng tùy thông báo của giảng viên.

## Bổ sung sau rà soát ngày 08/11/2026

- Đã sửa responsive 375px, liên kết nhãn bằng useId/htmlFor và ngôn ngữ vi.
- Đã sửa lỗi thả Enter làm tắt nốt trong khi vẫn giữ Space.
- Đã có project-rules.md, TASK_DECOMPOSITION.md đúng tên và AI_FAILURE_AUDIT.md.
- Ba lỗi được xác minh trên snapshot Git thật dd2bc92 và bản sửa, bằng npm run audit:verify.
- Xem reports/ai-audit/verification.json và ảnh trước/sau; Lighthouse 100/100 nằm trong reports.
- README đã thay nội dung mẫu bằng hướng dẫn riêng. Các nhận định cũ về tài liệu chưa hoàn thiện được cập nhật bởi mục này.
- Bằng chứng Profiler vẫn chưa có trong thư mục bài; không tuyên bố audit này thay thế cho yêu cầu đó.
