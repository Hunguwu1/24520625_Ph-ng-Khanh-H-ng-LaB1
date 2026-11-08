# Homework 2 — Piano 88 phím

React + Vite: piano A0–C8, đa âm 8 voice FIFO, ghi và phát lại ở 0.5×, 1×, 2× có hủy. Quãng tám tự xuống hàng, không cần cuộn ngang ở 375px.

## Chạy ứng dụng

```powershell
npm ci
npm run dev
```

Mở địa chỉ Vite in ra. Dùng chuột/cảm ứng hoặc Tab rồi giữ Space/Enter. Bản ghi chỉ giữ trong phiên, tải lại trang sẽ xóa.

## Kiểm tra

```powershell
npm test
npm run build
npm run lint
npm run audit:verify
```

Audit cần Chrome/Edge và Git có commit baseline dd2bc92. Đặt CHROME_PATH nếu trình duyệt ở vị trí khác. Công cụ xuất snapshot ra thư mục tạm rồi dọn sau khi kiểm tra, không checkout/reset mã hiện tại.

## Hồ sơ

- [Quy tắc](project-rules.md)
- [Phân rã công việc](TASK_DECOMPOSITION.md) và [WBS](WBS.md)
- [Audit ba lỗi](AI_FAILURE_AUDIT.md)
- [JSON xác minh trước/sau](reports/ai-audit/verification.json)
- [Lighthouse 375px](reports/lighthouse-375.report.html)
- [Kiểm tra accessibility](reports/ACCESSIBILITY.md)

Xem lịch sử riêng bài bằng `git log --oneline -- .` từ thư mục homework2. Commit được lưu cục bộ, chưa tự động đẩy remote.

## Giới hạn

Lighthouse Accessibility 100/100 trong lần đo đã lưu; chưa xác nhận toàn bộ WCAG bằng trình đọc màn hình và thiết bị cảm ứng thật. Chưa có ảnh/JSON React Profiler. Tối đa 8 voice đang giữ nhưng oscillator trong đuôi release 40 ms có thể chồng ngắn với voice mới. Audit không chứng minh AI là tác giả của mọi dòng mã lịch sử.
