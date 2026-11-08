# AI_FAILURE_AUDIT — PUBG Vietnam Arena (Lab 3)

## Phạm vi Lab 3

Hiện ghi nhận **1 lỗi thực tế của Lab 3** được phát hiện khi kiểm tra giao diện bằng Chrome, ngày 08/11/2026. Phần lịch sử Lab 2 phía dưới được giữ để tham khảo, **không tính là ba lỗi mới của Lab 3**. Cần ghi nhận thêm các lỗi thực sự phát hiện để đáp ứng yêu cầu ít nhất ba lỗi của đề.

## Lab 3 — Lỗi 1: Giao diện tràn ngang trên màn hình hẹp

**Nguồn gốc mã AI.** Trong cuộc trò chuyện triển khai Lab 3, Codex tạo giao diện React, bảng xếp hạng và CSS, nhưng chưa ràng buộc chiều rộng phần tử gốc `#app`. Lỗi được phát hiện trong lần kiểm tra trình duyệt sau commit `d4eb24f`. Khác với các sự cố lịch sử Lab 2 bên dưới, mã giao diện liên quan và lần phát hiện lỗi này có trong cuộc trò chuyện hiện tại.

**Cách tái hiện trước khi sửa.** Chạy `npm.cmd run dev`, mở ứng dụng trong Chrome ở viewport rộng 375px. Mở Console và đo `window.innerWidth` cùng `document.documentElement.scrollWidth`.

**Mong đợi.** Toàn trang vừa chiều rộng viewport; bảng điểm rộng hơn vùng chứa sẽ cuộn ngang riêng bên trong `.table-scroll`.

**Thực tế.** Viewport rộng **375px**, nhưng chiều rộng cuộn của trang là **487px**. `#app` và `.arena` rộng khoảng **487,17px**, khiến toàn trang tràn ngang. Ảnh trước khi sửa: [mobile-before.png](docs/audit/mobile-before.png).

**Nguyên nhân.** `body` dùng CSS Grid và căn giữa phần tử con. `#app` chưa có giới hạn chiều rộng nên kích thước nội tại của nội dung, gồm bảng xếp hạng, làm phần tử gốc rộng hơn viewport. `.arena` dùng chiều rộng phần trăm theo phần tử gốc này nên cũng bị kéo rộng. Chỉ thêm `overflow-x: auto` cho bảng chưa đủ để giới hạn chiều rộng toàn trang.

**Cách sửa.** Trong `src/style.css`, đặt `#app { width: 100%; min-width: 0; }` để phần tử gốc vừa vùng hiển thị và được phép thu nhỏ. Thêm `margin-inline: auto` cho `.arena` để giữ nội dung ở giữa trên màn hình lớn. Giữ cuộn ngang bên trong `.table-scroll`, không che lỗi bằng cách ẩn phần nội dung tràn của toàn trang.

**Kiểm chứng sau sửa.** Kiểm tra trên Chrome với Playwright, đo trực tiếp DOM thay vì chỉ đánh giá ảnh chụp:

| Chiều rộng viewport | Chiều rộng cuộn toàn trang sau sửa | Kết quả |
| --- | --- | --- |
| 320px | 320px | Đạt |
| 375px | 375px | Đạt |
| 390px | 390px | Đạt |
| 768px | 768px | Đạt |
| 1280px | 1280px | Đạt |

Ở viewport 375px, vùng chứa bảng rộng 295px, nội dung bảng rộng 407px và có thể cuộn ngang bên trong. Kiểm tra thêm bộ lọc kill-feed vẫn trả về 50 sự kiện khi chọn The Expendables; Virtual List tạo không quá 12 hàng, mỗi hàng cao 72px ở cả năm kích thước. `npm.cmd run build` thành công sau sửa. Đây là kiểm tra trên trình duyệt desktop với viewport thay đổi, chưa phải kiểm tra trên thiết bị di động thật.

Bằng chứng: [ảnh sau sửa](docs/audit/mobile-after.png), [số đo sau sửa](docs/audit/responsive-fixed.json).

**Bài học.** Khi dùng Grid/Flex và bảng dữ liệu, phải kiểm tra chiều rộng phần tử gốc cùng chuỗi phần tử chứa. Build thành công và kiểm tra logic component không chứng minh giao diện vừa màn hình; cần đo DOM và kiểm tra nhiều kích thước viewport.

---

## Lịch sử Lab 2 — Flash Sale E-Commerce Engine

Nội dung dưới đây được sao chép từ bài Lab 2; các mốc thời gian, lệnh và commit trong phần này thuộc Lab 2, không phải kết quả kiểm tra mới của Lab 3.

## Scope and Evidence

AI was used to break down the assignment, explain code, suggest implementation steps, and help investigate errors. This report examines **three specific incidents** encountered during development, their effects, the fixes, and the lessons learned. Logs and commits show that an issue or change occurred; they **do not, by themselves, prove** that AI wrote the code responsible for it. If the grading criteria require proof that AI authored each mistake, the relevant conversation excerpts or original drafts should be attached.

## 1. Transaction guidance did not account for the full call chain

**Observed behavior.** During reservation testing, `reservation validates stock, version and rollback` failed with `Error: cannot start a transaction within a transaction` in `reserveInventory()`.

**Cause.** During integration, the code contained two transaction starts. In addition, `expireReservations()` opens its own transaction, so calling it after `BEGIN IMMEDIATE` on the same SQLite connection would also create a nested transaction. Instructions that add an isolated code snippet without identifying the code it replaces can lead to this kind of error. The log alone does not establish that AI wrote the duplicated statement.

**Fix.** Call `expireReservations()` before opening the reservation transaction. Each reservation operation now has one `BEGIN IMMEDIATE`; the inventory update and reservation insert happen in that transaction, with `ROLLBACK` on failure. The current implementation is in `server/reservations.ts` and `server/expiration.ts`. Commit `116653a` records changes related to integrating expiration handling.

**Verification.** `server/reservations.test.ts` covers successful reservations, version conflicts, insufficient stock, and rollback when the reservation insert is forced to fail. The current test passes. This verifies the repaired version; it does not rerun the historical faulty version.

**Lesson.** When integrating AI suggestions, inspect transaction ownership throughout the call chain and state exactly which existing code a new snippet replaces.

## 2. Treating a passing test file as proof without checking its assertions

**Observed behavior.** An early test result included `✔ server\expiration.test.ts`, but inspection during troubleshooting found that the file did not yet contain assertions for expiration behavior. Therefore, the passing result did not prove that expired reservations released inventory correctly. The earlier file state is not preserved in Git history: `server/expiration.test.ts` was first committed in `116653a`. No original AI draft is available to establish who created the earlier file.

**Fix.** Add the test `expiration respects deadline, releases once and rolls back`. It checks that a reservation remains `ACTIVE` before its deadline; becomes `EXPIRED` and releases stock at the deadline; does not release stock twice on a repeated scan; and rolls back both reservation status and inventory when an inventory update fails.

**Verification.** The corresponding assertions are present in `server/expiration.test.ts`, and the test passes. Commit `116653a` contains the test.

**Lesson.** Read the test name, steps, and assertions before using a “pass” result as evidence. The number of passing test files is not the number of business scenarios verified.

## 3. A five-minute demo sale was too short for the assignment workflow

**Observed behavior.** The previous configuration set `endsAt = startsAt + 5 * 60 * 1000`. The backend ran beyond that deadline while the assignment was being studied, tested, and committed. The interface showed `Flash Sale đã kết thúc` (“Flash Sale has ended”), the countdown displayed `00:00.000`, and the buy button was disabled even though eight units remained. API data showed that `serverNow` had passed `endsAt`.

**Cause.** The suggested demo duration did not account for the fact that the sale starts when the **backend starts**, rather than when a user opens the page. Disabling purchases after the deadline was correct business behavior; the issue was the demo configuration and the explanation of the application lifecycle.

**Fix.** Commit `f29deaa` increased the default duration from five to 30 minutes, added configuration through `FLASH_SALE_DURATION_MS`, and validated the supplied value. Reloading the page does not extend the sale. Restarting the backend creates fresh demo data because SQLite runs in memory.

**Verification.** The diff in commit `f29deaa` shows the duration and validation changes. The current tests and build pass. The automated tests do not separately assert the 30-minute default; that configuration is supported by the code and by an API check performed after the fix.

**Lesson.** Before applying an AI-suggested value, check when the timer starts, how long the data lives, and how much time the real demo workflow takes. Resetting the frontend timer on each page load would make the shared backend deadline incorrect.

## Rechecking the Current Version

From `lab2/homework3`, run:

```powershell
npm.cmd test
npm.cmd run build
git show 116653a -- lab2/homework3/server/reservations.ts lab2/homework3/server/expiration.test.ts
git show f29deaa -- lab2/homework3/server/store.ts
```

On October 22, 2026, `npm.cmd test` reported **4 tests passed, 0 failed**, and `npm.cmd run build` completed successfully. These results establish the current state of the project; they do not replace the AI conversation record from the time each issue occurred.
