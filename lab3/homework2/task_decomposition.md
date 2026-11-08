# Task Decomposition — HW2 Piano 88 phím

Ngày cập nhật: 08/11/2026. Đối chiếu phạm vi và trạng thái trong [WBS.md](WBS.md).

## 1. Yêu cầu đầu vào và kết quả mong đợi

Đầu vào là thao tác nhấn/thả phím hoặc một bản ghi gồm các nốt có thời gian. Đầu ra là âm thanh đa nốt, giao diện phản ánh voice đang hoạt động và khả năng phát lại/hủy mà không để âm bị kẹt.

Các ràng buộc chính: sinh 88 phím A0–C8; 52 phím trắng, 36 phím đen; tính tần số từ MIDI; quản lý 8 voice hoạt động bằng Map và FIFO; React.memo cô lập render; ghi `{ midi, freqHz, durationMs, deltaMs }`; phát ở 0.5×, 1×, 2×; hủy bằng AbortController.

## 2. Phân rã tác vụ và quan hệ phụ thuộc

| ID | Tác vụ và cách thực hiện | Phụ thuộc | Đầu ra / điều kiện hoàn thành |
| --- | --- | --- | --- |
| T01 | Khởi tạo React + Vite, cài thư viện và xác nhận trang chạy | Không | Có môi trường phát triển, build và lint |
| T02 | Duyệt MIDI 21–108; ánh xạ nhóm 12 bán cung; tính quãng tám và tần số | T01 | `generatePianoKeys()`, đúng 88 nốt và A4 = 440 Hz |
| T03 | Tính vị trí phím trắng; đặt phím đen tại ranh giới hai phím trắng | T02 | Bàn phím đúng nhóm phím đen, có cuộn ngang |
| T04 | Tách một phím thành component memo; truyền MIDI, tên nốt, vị trí, trạng thái | T03 | 88 instance PianoKey với `key={midi}` |
| T05 | Xử lý pointer down/up/cancel/lost capture và Space/Enter | T04 | Nhấn/thả đúng một nốt, không kẹt trạng thái khi kéo ra ngoài |
| T06 | Tạo PolyphonicSynth, khởi tạo/resume context trong tương tác người dùng | T02 | `prepare()`, `noteOn()`, `noteOff()` hoạt động |
| T07 | Tạo oscillator + gain cho từng voice; đặt tần số; ngắt node sau khi kết thúc | T06 | Phát đồng thời nhiều nốt và dọn node |
| T08 | Lưu voice trong Map; lấy khóa đầu tiên để thay nốt cũ nhất; bỏ nhấn trùng | T07 | Tối đa 8 voice hoạt động; trả `stolenMidi` cho App |
| T09 | Tạo PeriodicWave dùng chung và envelope lên âm/giảm âm/release | T07 | Âm piano tổng hợp; release 40 ms trước khi dừng nốt |
| T10 | Giữ bộ âm bằng ref; quản lý pressedKeys; callback dùng useCallback | T05, T08 | Màu đúng theo voice; callback ổn định giữa các lần render |
| T11 | Tạo NoteRecorder, dùng đồng hồ performance.now và Map nốt đang giữ | T02 | Các hàm start/noteOn/noteOff/releaseAll/stop/clear/snapshot |
| T12 | Gắn recorder vào nhấn/thả; chốt nốt bị FIFO thay thế; hiển thị bảng ghi | T10, T11 | Bản ghi đúng thứ tự nhấn kể cả khi thả ngược thứ tự |
| T13 | Chuyển bản ghi thành danh sách sự kiện bật/tắt có thời gian tuyệt đối tương đối với đầu bản | T12 | Lịch giữ được khoảng nghỉ đầu bản và các nốt chồng nhau |
| T14 | Phát lịch bất đồng bộ theo một đồng hồ chung; chia thời gian cho speed | T08, T13 | Chạy đúng 0.5×, 1× và 2×; không chờ nốt trước tắt mới bật nốt sau |
| T15 | Gắn id cho từng sự kiện; hủy lượt cũ trước lượt mới; bỏ lịch tắt đã lỗi thời | T14 | Không tắt nhầm nốt cùng MIDI được bật lại |
| T16 | Thêm AbortController, hủy timer, kết thúc Promise chờ và tắt mọi voice | T14, T15 | Stop có hiệu lực cả khi đang chờ audio resume hoặc chờ nốt đầu |
| T17 | Thêm nút Phát/Dừng và tốc độ; khóa ghi/xóa/tốc độ/chơi trực tiếp khi phát | T12, T16 | Các chế độ không xung đột; màu phím theo lịch phát |
| T18 | Dừng khi blur, pagehide hoặc trang ẩn; dispose khi unmount | T10, T16 | Không có lịch phát tiếp sau khi rời trang; gỡ listener |
| T19 | Viết kiểm tra với đồng hồ giả và AudioContext giả; chạy build/lint | T08–T18 | 24 bài kiểm tra hiện tại đạt; build/lint đạt |
| T20 | Đo bằng React DevTools Profiler và kiểm tra trình duyệt | T17–T19 | Ảnh và JSON chứng minh chỉ phím thao tác render |
| T21 | Lập WBS, task decomposition, hoàn thiện README và hồ sơ nộp | T20 | Hai file phân rã đã có; README và quy định nộp còn cần rà soát |

Luồng phụ thuộc chính: T01 → T02 → giao diện/bộ âm → tích hợp → ghi → phát lại → hủy và cleanup → kiểm tra → tài liệu.

## 3. Thiết kế dữ liệu

### 3.1. Một phím

```js
{
  midi: 69,
  noteName: 'A4',
  isBlack: false,
  freqHz: 440,
}
```

Công thức: `freqHz = 440 * 2 ** ((midi - 69) / 12)`. Quãng tám: `Math.floor(midi / 12) - 1`. Không tạo danh sách 88 thẻ bằng tay.

### 3.2. Voice đang hoạt động

```text
voices: Map<midi, { osc, gain }>
allVoices: Set<voice>
```

`voices` quản lý các nốt đang giữ và thứ tự FIFO. `allVoices` còn giữ những voice trong giai đoạn release để stopAll có thể dừng cả phần đuôi âm. Không dùng giới hạn 2 tác vụ tải file của Lab 2 làm giới hạn đa âm cho bài piano.

### 3.3. Một nốt trong bản ghi

```js
{
  midi: 60,
  freqHz: 261.625565,
  durationMs: 500,
  deltaMs: 200,
}
```

- `deltaMs`: khoảng cách giữa hai lần bắt đầu nốt liên tiếp. Với nốt đầu, tính từ lúc bắt đầu ghi.
- `durationMs`: khoảng thời gian từ nhấn đến thả hoặc đến lúc bị dừng/thay thế.
- Thêm mục ngay khi nhấn; khi thả chỉ cập nhật thời lượng, không đổi vị trí mục.
- Khi đang giữ, thời lượng trong snapshot hiện là 0 cho đến khi được chốt; đây không phải đồng hồ thời lượng cập nhật liên tục.
- Snapshot sao chép từng mục để bên ngoài không sửa trực tiếp bộ ghi.

### 3.4. Sự kiện phát lại

```text
{ time, order, type: 'on' | 'off', id, midi, freqHz? }
```

Tính thời điểm bắt đầu bằng tổng delta chia speed; thời điểm kết thúc bằng thời điểm bắt đầu cộng duration chia speed. Sắp xếp bật/tắt trên cùng một trục thời gian, dùng id để phân biệt các lần chơi cùng MIDI. Những sự kiện cùng thời điểm được xử lý theo thứ tự xác định; nốt có thời lượng 0 vẫn được bật trước khi tắt chính nó.

## 4. Luồng xử lý

### 4.1. Chơi trực tiếp

```text
Pointer/Space/Enter
→ PianoKey gọi callback với MIDI
→ App tra tần số và gọi synth.noteOn
→ Synth thay voice cũ nhất nếu đã đủ 8 voice
→ App chốt nốt bị thay thế trong recorder nếu đang ghi
→ App cập nhật pressedKeys và bộ ghi
→ Chỉ PianoKey có props thay đổi render lại
```

Khi thả/cancel/mất capture, gọi noteOff và bỏ trạng thái nhấn. Callback được giữ ổn định; không truyền toàn bộ Set pressedKeys xuống mỗi phím.

### 4.2. Ghi

```text
Bắt đầu ghi → dừng âm cũ → xóa dữ liệu ghi cũ → lưu mốc thời gian
Nhấn nốt → lưu delta và thời điểm bắt đầu → thêm vào danh sách
Thả hoặc FIFO thay nốt → chốt duration
Kết thúc ghi → chốt tất cả nốt còn giữ → dừng âm → lấy snapshot
```

Nút Dừng tất cả âm hoặc sự kiện mất focus chốt các nốt đang giữ. Bộ ghi vẫn tiếp tục ở trạng thái ghi cho đến khi bấm Kết thúc ghi. Không cho xóa trong khi đang ghi.

### 4.3. Phát lại và hủy

```text
Phát bản ghi → dừng lượt cũ → chuẩn bị AudioContext → lấy mốc thời gian chung
→ lần lượt xử lý sự kiện bật/tắt đến hạn
→ cập nhật màu phím theo voice còn hoạt động
→ chờ đến mốc kết thúc muộn nhất và phần đuôi release → hoàn tất
```

```text
Dừng phát / chuyển tab / mất focus
→ abort lượt hiện tại
→ hủy timer và kết thúc Promise đang chờ
→ stopAll voice
→ xóa màu phím và trạng thái đang phát
```

Cleanup của lượt cũ chỉ được tác động khi nó còn là lượt hiện tại. Khi unmount, bộ phát lại được dispose trước bộ tổng hợp âm.

## 5. Kế hoạch xác minh

| Nhóm | Kịch bản chính | Cách kiểm tra |
| --- | --- | --- |
| Dữ liệu | 88 phím; 52 trắng/36 đen; A0–C8; A4 = 440 Hz | Đối chiếu thuật toán và dữ liệu sinh |
| Synth | Nốt thứ 9/10 thay đúng nốt; nhấn trùng; thả nốt cũ không tác động voice mới; giữ tần số khi đổi âm sắc | `tests/polyphonic-synth.test.js` |
| Recorder | Khoảng nghỉ đầu; thả ngược thứ tự; nhấn trùng; stop chốt nốt; clear/start; snapshot độc lập | `tests/note-recorder.test.js` |
| Replay | 3 tốc độ; hợp âm; nốt bắt đầu sớm nhưng kết thúc muộn; timer trễ không cộng dồn sai nhịp | `tests/audio-task-queue.test.js` |
| Cancellation | Stop lúc chờ timer/resume; restart; dispose; lỗi audio; lịch tắt cùng MIDI đã cũ | `tests/audio-task-queue.test.js` |
| Giao diện | Nhấn/thả, kéo ra ngoài, cuộn ngang, ghi/phát, Stop, chuyển tab | Thao tác thực tế trên trình duyệt |
| Render | Ghi Profiler rồi chỉ nhấn/thả một phím, không bắt đầu ghi nốt/phát bản ghi | Đã đo trong phiên kiểm tra; cần xuất lại JSON và ảnh nếu nộp minh chứng |

Các lệnh kiểm tra từ thư mục bài:

```powershell
node --test tests/*.test.js
npm run build
npm run lint
```

Kết quả gần nhất ngày 08/11/2026: 24/24 bài kiểm tra đạt, build và lint đạt. Profiler cho thấy đủ 88 PianoKey; hai commit từ nhấn/thả A0 chỉ render App và PianoKey key="21". 87 phím còn lại không render trong hai commit này. Tệp kết quả, ảnh và JSON Profiler đã thu không còn trong bản làm việc hiện tại, nên không được đóng gói trong lần đẩy GitHub này.

## 6. Gợi ý chia công việc trong một tuần

Đây là lịch đề xuất để tổ chức công việc, không phải bảng chấm công đã đo.

| Ngày | Phạm vi |
| --- | --- |
| 1 | Môi trường, đọc đề, đối chiếu Lab 2, sinh dữ liệu 88 phím |
| 2 | Giao diện, component phím, pointer capture và trạng thái nhấn |
| 3 | Web Audio, đa âm, giới hạn voice và FIFO |
| 4 | Bộ ghi, thứ tự nốt, delta và duration |
| 5 | Phát lại, hợp âm và điều chỉnh tốc độ |
| 6 | Hủy phát, cleanup, trường hợp lỗi và kiểm tra tự động |
| 7 | Profiler, bằng chứng, tài liệu và rà soát cách nộp |

## 7. Điều kiện bàn giao và phần còn lại

- Có mã nguồn, cấu hình cài/chạy và các bài kiểm tra.
- Khi hồ sơ nộp yêu cầu, bổ sung lại ảnh và dữ liệu Profiler thật; không thay thế bằng nhận định chỉ dựa vào React.memo trong mã.
- Cần cập nhật README hiện còn là mẫu Vite thành hướng dẫn riêng của bài.
- Cần xác nhận cách chấm giới hạn 8 oscillator: hiện có 8 voice hoạt động nhưng đuôi release 40 ms có thể tạo chồng oscillator ngắn.
- Bản ghi chưa lưu bền vững; âm sắc là tổng hợp; chưa có đo bộ nhớ dài hạn. Không ghi các mục này là đã xác minh nếu chưa đo thêm.
- Sau khi rà soát, lưu commit tài liệu/bằng chứng theo nhu cầu; các commit chức năng thực tế được liệt kê trong WBS.
