# Lab 3 HW 1 — Production Studio Drum Kit

Bộ trống React + TypeScript, nâng cấp từ bài Drum Kit cũ và áp dụng kỹ thuật bàn phím, focus từ Lab 2 HW 1.

## Chức năng

- Bảy pad W/A/S/D/J/K/L; dùng chuột, Tab, Enter và Space.
- Nhận phím vật lý bằng event.code, chặn giữ phím tự lặp, bỏ qua vùng nhập liệu và có công tắc phím tắt.
- Pad sáng, aria-pressed và lịch sử mười lần đánh với aria-live polite.
- Web Audio API, cache dữ liệu âm thanh và source riêng cho mỗi lần đánh.
- Meter mức tín hiệu thực từ -60 đến 0 dBFS, không phải độ ồn môi trường.

## Chạy bài

Yêu cầu Node.js phù hợp với Vite 8 và npm. Tại thư mục lab3/homework1:

```powershell
npm ci
npm run dev
```

Kiểm tra bản production:

```powershell
npm run build
npm run lint
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

## Tài liệu và bằng chứng

- [WBS](./WBS.md)
- [Task decomposition](./TASK_DECOMPOSITION.md)
- [Project rules](./project-rules.md)
- [AI failure audit: 3 verified bugs](./AI_FAILURE_AUDIT.md)
- [Báo cáo kiểm tra và giới hạn](./artifacts/verification.md)
- [Lighthouse HTML](./artifacts/lighthouse-report.html)
- [Nguồn âm thanh bổ sung](./public/sounds/CREDITS.md)

Lần đo mobile trên localhost ngày 09/11/2026 ghi nhận 100 ở Performance, Accessibility, Best Practices và SEO. Kiểm tra lại không tràn ngang tại 375px; input và meter dùng label htmlFor kết hợp useId(). Kết quả không thay thế đánh giá đầy đủ WCAG 2.2 AA. UniKey, NVDA và zoom 200% trực tiếp còn chờ kiểm tra.

## Chạy lại công cụ kiểm tra

Giữ preview chạy ở cổng 4173. Trong terminal khác:

```powershell
npm ci --prefix artifacts/tools
node artifacts/tools/check-app.mjs
node artifacts/tools/run-lighthouse.mjs
```

Các script kiểm tra hiện dùng Chrome tại C:/Program Files/Google/Chrome/Application/chrome.exe; chỉnh đường dẫn nếu máy cài ở vị trí khác. node_modules, dist và bản sao phục vụ publish không được đưa vào Git.

## Git delivery

The verified delivery is in `.publish-checkout`, branch `codex/drumkit-verified-audit`, project path `lab3/homework1`. Eight focused follow-up commits preserve baseline `067e2d3`; no remote push was performed. The outer workspace belongs to a different parent repository. Submit the delivery branch with its history, not just a ZIP.

```powershell
git -C .publish-checkout log --reverse --oneline 067e2d3..HEAD -- lab3/homework1
```

After a normal clone, run the Git command from the repository root without `-C .publish-checkout`. Reproduction commands and evidence are in AI_FAILURE_AUDIT.md.
