# AI Failure Mode Audit — Production Studio Drum Kit

Ngày xác minh: 09/11/2026, Asia/Saigon. JSON lưu thời gian UTC (08/11/2026 17:xx UTC tương ứng 09/11/2026 00:xx tại Việt Nam).

## Phạm vi và tính trung thực

Đây là audit do AI hỗ trợ, kiểm tra ba lỗi có thật trong baseline Git `067e2d3`, đường dẫn `lab3/homework1`. Không có bản ghi prompt/response ban đầu để quy trách nhiệm tác giả cho từng dòng; không khẳng định AI đã tạo từng lỗi. Các failure mode dưới đây mô tả lỗ hổng suy luận và kiểm chứng cần tránh khi dùng AI. Không cố tình thêm lỗi vào sản phẩm để tạo bằng chứng.

Harness dùng lại App.tsx và useDrumKeyboard.ts nguyên bản lấy bằng git show từ baseline; các tài nguyên phụ trợ dùng bản hiện tại. Đây không phải khôi phục toàn bộ môi trường lịch sử. Hai file chứa tất cả logic liên quan đến ba lỗi; script chuẩn bị baseline có thể kiểm tra được. Chrome headless được dùng cho hành vi trình duyệt.

## B1 — Nhãn truy cập hợp lệ nhưng không đáp ứng hợp đồng htmlFor + useId

- **Yêu cầu:** mỗi input và meter có label htmlFor trỏ đến ID sinh bằng useId().
- **Vị trí baseline:** App.tsx, checkbox phím tắt, ô ghi chú và meter.
- **Tái hiện:** mở baseline; kiểm tra input.labels, label.htmlFor, ID và mã nguồn App.
- **Quan sát:** checkbox không có ID, label.htmlFor rỗng; các ID còn lại là hằng; không có lời gọi useId(). Xem B1 trong ai-audit-baseline.json: passed=false.
- **Nguyên nhân:** dùng label bọc input và ID cố định; nhầm việc vượt qua kiểm tra accessibility tự động với tuân thủ chính xác quy định bài tập. Đây là lỗi hợp đồng của đề, không phải bằng chứng checkbox mất tên truy cập hay một vi phạm WCAG tự thân.
- **Failure mode khi dùng AI:** chỉ yêu cầu hoặc tin kết quả Lighthouse 100 mà không đối chiếu từng ràng buộc mã nguồn.
- **Sửa:** ba ID từ useId(), dùng chung cho id và htmlFor tương ứng. Commit `1014993`.
- **Xác minh:** B1 final passed=true; cả ba control có nhãn tường minh. Kiểm tra chức năng bổ sung xác nhận ID không trùng.

## B2 — Phím trong phiên soạn IME vẫn đánh trống

- **Yêu cầu:** phím đang phục vụ soạn ký tự không tạo shortcut đánh trống.
- **Vị trí baseline:** useDrumKeyboard.ts, onKeyDown.
- **Tái hiện:** gửi KeyboardEvent keydown với code=KeyA, key=a, isComposing=true tới window. Đây là mô phỏng có chủ đích của nhánh sự kiện, không phải thử UniKey trực tiếp.
- **Quan sát:** từ 'Chưa có lần đánh nào.' thành 'Lần 1: Kick'. B2 baseline passed=false.
- **Nguyên nhân:** hook chặn repeat, modifier và vùng nhập liệu nhưng bỏ sót event.isComposing. Trong trường hợp target là input, bộ lọc cũ đã chặn; ca này kiểm tra riêng hợp đồng composition khi sự kiện tới listener toàn cục.
- **Failure mode khi dùng AI:** coi việc sử dụng event.code và bỏ qua input là đủ để hỗ trợ mọi trạng thái bộ gõ.
- **Sửa:** return khi event.isComposing. Commit `041fce6`.
- **Xác minh:** cùng sự kiện trên bản sửa giữ nguyên output, B2 final passed=true. Các phím thông thường vẫn vượt qua check-app.mjs.

## B3 — Giữ Enter trên nút tạo nhiều lần đánh

- **Yêu cầu:** giữ phím chỉ tạo một lần đánh, bao gồm khi pad đang được focus.
- **Vị trí baseline:** App.tsx, button onClick; hook chỉ chống lặp cho các phím chữ.
- **Tái hiện:** focus pad Kick; Playwright keyboard.down('Enter') hai lần rồi keyboard.up('Enter'). Lần down thứ hai là keydown repeat thật do trình duyệt tạo; native button sinh click tương ứng.
- **Quan sát:** lần đầu 'Lần 1: Kick', lặp thành 'Lần 2: Kick'. B3 baseline passed=false.
- **Nguyên nhân:** event.repeat được lọc trong hook shortcut nhưng Enter kích hoạt onClick theo hành vi native của button, không qua ánh xạ W/A/S/D/J/K/L.
- **Failure mode khi dùng AI:** chỉ kiểm tra đường gọi tự viết, bỏ qua đường gọi native hội tụ vào cùng callback.
- **Sửa:** chặn default cho repeated Enter/Space trong onKeyDown của pad; giữ nguyên click và lần nhấn đầu. Commit `40fa679`.
- **Xác minh:** lần down thứ hai vẫn 'Lần 1: Kick', B3 final passed=true; kiểm tra Enter, Space và Tab thông thường vẫn đạt.

## Bằng chứng và cách chạy lại

- `artifacts/ai-audit-baseline.json`: ba assertion đều false, chứng minh lỗi tái hiện được.
- `artifacts/ai-audit-final.json`: cùng ba assertion đều true.
- `artifacts/functional-results.json`: luồng chức năng, bàn phím, nhãn, axe và responsive đều đạt.
- `artifacts/lighthouse-report.html` và JSON: kết quả đo lại sau sửa.

Tại thư mục bài, cài npm ci và npm ci --prefix artifacts/tools. Chrome được cấu hình theo đường dẫn Windows trong script.

```powershell
node artifacts/tools/prepare-ai-baseline.mjs
node node_modules/vite/bin/vite.js .audit-baseline --host 127.0.0.1 --port 4174 --strictPort
```

Giữ terminal đó chạy. Trong terminal thứ hai:

```powershell
node artifacts/tools/check-ai-audit.mjs http://127.0.0.1:4174 baseline
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Giữ preview chạy; trong terminal thứ ba:

```powershell
node artifacts/tools/check-ai-audit.mjs http://127.0.0.1:4173 final
node artifacts/tools/check-app.mjs
node artifacts/tools/run-lighthouse.mjs
npm run lint
```

Chế độ baseline trả exit code 0 khi cả ba assertion đều thất bại như dự kiến; final chỉ trả 0 khi cả ba đạt. Các JSON ghi kết quả thô, không đổi false thành true. Script prepare có thể nhận đường dẫn repository làm đối số; mặc định tìm .publish-checkout rồi mới dùng thư mục hiện tại. Cần có commit 067e2d3 trong lịch sử Git, không chỉ bản ZIP.

## Atomic commits và giới hạn

Lịch sử cũ được giữ nguyên. Tám commit tiếp nối trên nhánh `codex/drumkit-verified-audit` lần lượt phục vụ: quy tắc, kế hoạch audit, nhãn useId, chặn IME, chặn native repeat, kiểm tra và bằng chứng, báo cáo forensic, cuối cùng đồng bộ bằng chứng accessibility và hướng dẫn. Đây là thay đổi thực tế hiện tại, không phải tám mốc phát triển gốc được dựng lại.

Từ repository, xem bằng:

```powershell
git log --reverse --oneline 067e2d3..HEAD -- lab3/homework1
```

Audit xác minh lỗi và hiệu quả sửa trong phạm vi ca kiểm tra. Chưa thử IME vật lý, NVDA hoặc zoom trình duyệt thực tế; không tuyên bố chứng nhận toàn bộ WCAG 2.2 AA hoặc bảo đảm điểm chấm.
