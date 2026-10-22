# WBS — Homework 1: Production Enterprise Data-Grid

## 1. Mục tiêu và phạm vi

Xây dựng DataGrid dùng React và TypeScript, có sắp xếp, tìm kiếm, phân trang và chọn hàng. Component sử dụng HTML ngữ nghĩa, hỗ trợ bàn phím và công nghệ hỗ trợ theo yêu cầu WCAG 2.2 AA của đề.

- Thư mục bàn giao: `lab2/homework1`.
- Công nghệ: React, TypeScript, Vite, CSS, Oxlint.
- Thời lượng theo đề: một tuần; không phải thời gian thực hiện đã đo.
- Dữ liệu minh họa: sáu nhân viên, bốn cột; mỗi trang tối đa năm hàng.
- Yêu cầu Lighthouse: Accessibility và Best Practices đều đạt 100/100.
- Ngày cập nhật: 22/10/2026.

## 2. Phân rã công việc

| Mã WBS | Công việc | Sản phẩm / tiêu chí hoàn thành | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| 1.1 | Khởi tạo ứng dụng | Dự án React + TypeScript chạy bằng Vite | — | Hoàn thành |
| 1.2 | Định nghĩa hợp đồng component | `ColumnDef<T>` và `DataGridProps<T>` đúng các thuộc tính của đề | 1.1 | Hoàn thành |
| 1.3 | Chuẩn bị dữ liệu minh họa | Danh sách nhân viên và cấu hình cột trong `sample-data.ts` | 1.2 | Hoàn thành |
| 2.1 | Dựng bảng ngữ nghĩa | Dùng `table`, `thead`, `tbody`, `th scope="col"`, `td` và `button` | 1.2 | Hoàn thành |
| 2.2 | Tích hợp giao diện | `App.tsx` truyền dữ liệu, cột và tên truy cập vào DataGrid | 1.3, 2.1 | Hoàn thành |
| 3.1 | Tìm kiếm dữ liệu | Lọc các cột, cập nhật số kết quả và thông báo khi rỗng | 2.2 | Hoàn thành |
| 3.2 | Sắp xếp | Tăng/giảm theo cột; so sánh số và chuỗi; cập nhật `aria-sort` | 2.2 | Hoàn thành |
| 3.3 | Phân trang | Năm hàng mỗi trang; khóa nút ở biên; lọc/sắp xếp đưa về trang đầu | 3.1, 3.2 | Hoàn thành |
| 3.4 | Chọn hàng | Click hoặc Enter chọn hàng; Space chọn/bỏ chọn; hỗ trợ `onRowSelect` | 3.3 | Hoàn thành |
| 4.1 | Điều hướng bàn phím | Bốn phím mũi tên di chuyển giữa các ô, không vượt biên | 3.3 | Hoàn thành |
| 4.2 | Quản lý focus | Một điểm Tab trong bảng, Tab rời bảng, focus có viền nhìn thấy | 4.1 | Hoàn thành |
| 4.3 | Bổ sung thông tin truy cập | Tên bảng, nhãn tìm kiếm, hướng dẫn, role grid/row/gridcell, chỉ số hàng và trạng thái chọn | 2.1, 3.4 | Hoàn thành qua mã nguồn |
| 4.4 | Thông báo cập nhật | `role="status"` cho kết quả tìm kiếm; `aria-live` cho số trang | 3.1, 3.3 | Hoàn thành qua mã nguồn |
| 4.5 | Màu sắc và bố cục | Kiểm tra tương phản, chế độ sáng/tối, màn hình hẹp và phóng to | 2.2, 4.2 | Đã triển khai; cần đối chiếu đủ bằng chứng nghiệm thu |
| 4.6 | Sửa tiêu đề xuống dòng | Thêm `line-height: 1.2` để tránh chữ tiêu đề chồng nhau | 4.5 | Đã sửa trong mã nguồn |
| 5.1 | Kiểm tra chức năng | Tìm kiếm, rỗng, sắp xếp số, phân trang và chọn/bỏ chọn chạy đúng | 3.1–3.4 | Đã kiểm tra trong phiên làm bài |
| 5.2 | Kiểm tra bàn phím | Di chuyển, giới hạn biên, Enter, Space, Tab và Shift+Tab | 4.1, 4.2 | Đã kiểm tra trong phiên làm bài |
| 5.3 | Kiểm tra Lighthouse | Bản build đạt Accessibility 100 và Best Practices 100 | 4.1–4.6 | Đã có ảnh kết quả người làm bài cung cấp |
| 5.4 | Kiểm tra trình đọc màn hình | Đọc đúng tên cột, ô, trạng thái chọn/sắp xếp và cập nhật kết quả/trang | 4.3, 4.4 | Cần lưu và đối chiếu bằng chứng kiểm thử trong bộ bàn giao |
| 5.5 | Rà soát WCAG 2.2 AA | Lập bảng tất cả tiêu chí A/AA áp dụng, kết quả và bằng chứng | 5.1–5.4 | Chưa xác nhận đầy đủ trong tài liệu này |
| 5.6 | Kiểm tra build và lint | `npm run build` và `npm run lint` thành công | 4.6 | Đạt ngày 22/10/2026 |
| 6.1 | Lưu lịch sử Git | Giữ commit gốc và commit phần hoàn thiện | 5.6 | Hoàn thành |
| 6.2 | Đưa bài lên GitHub | Mã nguồn nằm tại `lab2/homework1` trên nhánh `main` | 6.1 | Hoàn thành |
| 6.3 | Lập WBS | Tài liệu công việc, tiêu chí, phụ thuộc và trạng thái | 6.2 | Hoàn thành trong file này |

## 3. Luồng xử lý

```text
Dữ liệu đầu vào → lọc theo query → sắp xếp → cắt trang → render bảng
Thao tác người dùng → cập nhật state → tính lại dữ liệu → cập nhật giao diện
Phím mũi tên → xác định ô kế tiếp → giới hạn theo biên → chuyển focus
Enter / Space → cập nhật hàng được chọn → cập nhật aria-selected và CSS
```

## 4. Kiểm tra và điều kiện nghiệm thu

| Nội dung | Bằng chứng hiện có / bước nghiệm thu |
|---|---|
| Chức năng và bàn phím | Đã thử tìm kiếm, kết quả rỗng, sắp xếp lương, hai trang dữ liệu, chọn/bỏ chọn và di chuyển focus trong phiên làm bài |
| Tương phản | Lần kiểm tra giao diện tối đo chữ thường khoảng 7,04:1, chữ trên nút hoạt động khoảng 5,33:1 và hàng được chọn khoảng 12,04:1; cần kiểm tra các trạng thái còn lại khi nghiệm thu |
| Lighthouse | Ảnh bản preview tại cổng 4173 do người làm bài cung cấp ghi nhận Accessibility 100 và Best Practices 100; ảnh không được đính kèm trong commit WBS này |
| Build và lint | Đã chạy thành công trước khi push mã nguồn ngày 22/10/2026 |
| Trình đọc màn hình | Cần ghi rõ trình duyệt, trình đọc màn hình, phiên bản, thao tác và kết quả thực tế trong báo cáo kiểm thử |
| WCAG 2.2 AA | Chỉ kết luận sau khi đánh giá đầy đủ các tiêu chí A/AA áp dụng cho toàn trang và các trạng thái của trang |

Điểm Lighthouse 100 không thay thế kiểm thử thủ công và không tự xác nhận tuân thủ toàn bộ WCAG 2.2 AA. WBS này ghi nhận công việc và bằng chứng đã biết, không phải chứng nhận tuân thủ. Các công cụ, báo cáo và ảnh thử nghiệm trong thư mục `artifacts` ở máy làm bài chưa được đưa vào repo.

## 5. Mốc Git

| Commit | Nội dung |
|---|---|
| `1755dc3` | Add filtering and sorting to data grid |
| `3b9a626` | Complete data grid pagination, keyboard navigation and accessibility |
| `af7b6b0` | Add Homework 1 under lab2 with original commit history |

Commit gốc được giữ trong lịch sử hợp nhất. File WBS được bổ sung bằng một commit tài liệu riêng sau các mốc trên.

## 6. File bàn giao và cách chạy

- `src/data-grid-contract.ts`: hợp đồng kiểu dữ liệu của component.
- `src/DataGrid.tsx`: bảng, xử lý dữ liệu, bàn phím và thông tin truy cập.
- `src/sample-data.ts`: dữ liệu nhân viên và cấu hình cột.
- `src/App.tsx`: trang minh họa sử dụng component.
- `src/App.css`, `src/index.css`: kiểu hiển thị, focus và trạng thái chọn.
- `index.html`: ngôn ngữ trang tiếng Việt và điểm khởi động.
- `package.json`, `package-lock.json`: lệnh chạy và phiên bản thư viện.
- `WBS.md`: phân rã công việc và điều kiện nghiệm thu.

Tại thư mục `lab2/homework1`, chạy:

```sh
npm ci
npm run build
npm run lint
npm run preview
```

Mở địa chỉ mà Vite in ra để kiểm tra bản build (mặc định `http://localhost:4173`). Dùng `npm run dev` khi phát triển; dùng bản preview khi đối chiếu kết quả Lighthouse.
