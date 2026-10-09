# WBS — Exercise 1: Mini-React VNode & Mounting Engine

## 1. Mục tiêu và phạm vi

Tự xây dựng `createElement`, `createTextElement` và `renderToDOM` bằng JavaScript và DOM API. Kết quả phải dùng semantic tags, hiển thị chuỗi HTML trong children dưới dạng text, có kiểm tra kiểu dữ liệu và có bằng chứng đối chiếu VNode với DOM thực tế.

Phạm vi bài này là tạo VNode và mount DOM. Không yêu cầu JSX, component, state hoặc cơ chế cập nhật DOM như React đầy đủ.

## 2. Cấu trúc phân rã công việc

| Mã WBS | Hạng mục / công việc | Đầu ra | Tiêu chí hoàn thành |
| --- | --- | --- | --- |
| 1.0 | Chuẩn bị bài làm | Cấu trúc thư mục và mô hình VNode | Xác định rõ các file và luồng VNode → DOM → mount |
| 1.1 | Tạo trang chạy thử | `index.html` | Có phần tử `id="app"` và nạp `test-runner.js` bằng module |
| 1.2 | Thiết kế cấu trúc VNode | `{ type, props: { children } }` | Element VNode có tên thẻ; text VNode có `nodeValue` và children rỗng |
| 2.0 | Xây dựng factory | Phần factory trong `mini-react.js` | Tạo cây VNode mà chưa tạo DOM thật |
| 2.1 | Viết `createTextElement` | Text VNode | Nhận string hoặc số hữu hạn; chuyển nội dung thành string; từ chối kiểu sai |
| 2.2 | Viết `createElement` | Element VNode | Xử lý tên thẻ, props, children và trả về cấu trúc thống nhất |
| 2.3 | Chuẩn hóa children | Mảng children hợp lệ | Làm phẳng mảng; chuyển string/number thành text VNode; bỏ null/undefined/boolean |
| 2.4 | Viết typeguard | `isObject`, `isText`, `isVNode` | Kiểm tra cấu trúc VNode và children bằng đệ quy; từ chối object không hợp lệ |
| 2.5 | Lưu commit factory | Commit thứ nhất | Message: `feat(core): implement createElement factory`; factory hoàn chỉnh, không lỗi cú pháp |
| 3.0 | Xây dựng mounting engine | `renderToDOM` trong `mini-react.js` | Chuyển cây VNode hợp lệ thành cây DOM |
| 3.1 | Render text VNode | DOM Text node | Dùng `document.createTextNode`, không phân tích children thành HTML |
| 3.2 | Render element và props | DOM Element và attributes | Dùng `document.createElement`; xử lý `id`, `role`, `className` và các thuộc tính trong bài |
| 3.3 | Gắn sự kiện | Event listener cho `onClick` | Dùng `addEventListener`; event handler phải là function |
| 3.4 | Render children và mount | Cây DOM gắn vào `#app` | Render đệ quy, dùng `appendChild` và `root.replaceChildren(renderToDOM(vApp))` |
| 4.0 | Kiểm tra chức năng và DOM | `test-runner.js` và kết quả audit | Các assertion đạt; DOM ứng dụng khớp cây VNode |
| 4.1 | Tạo cây ứng dụng semantic | VNode chứa `main`, `header`, `section`, `button` | DOM có `main`, `section`, `button`; không có div-soup |
| 4.2 | Kiểm tra XSS qua string child | Test với `<script>alert(1)</script>` | Payload hiển thị nguyên văn thành text; không tạo element script, không chạy alert |
| 4.3 | Kiểm tra payload bổ sung | Test với `<img onerror=alert(1)> Safe Text` | Payload thành text; không tạo element img |
| 4.4 | Kiểm tra props, sự kiện và typeguard | Các assertion trong test runner | `className` thành `class`, role đúng, click in `Ping`, input sai gây `TypeError` |
| 4.5 | Đối chiếu VNode và DOM | `assertTreeMatches` | Tên thẻ, nội dung text, số lượng và thứ tự childNodes khớp; mount root có đúng một node con |
| 4.6 | Audit trực tiếp bằng DevTools | Quan sát Elements và Console; ảnh chụp nếu cần nộp | Kiểm tra Elements không có node thừa/thiếu; Console không có assertion thất bại |
| 5.0 | Hoàn thiện và bàn giao | Các file bài làm và lịch sử Git | Đủ sản phẩm, kiểm tra và hai commit theo đề |
| 5.1 | Lưu commit renderer | Commit thứ hai | Message: `feat(core): implement renderToDOM`; chứa renderer, `index.html` và `test-runner.js` |
| 5.2 | Kiểm tra sản phẩm cuối | `index.html`, `mini-react.js`, `test-runner.js`, `WBS.md` | Trang chạy qua server tĩnh; ba file ứng dụng đã được theo dõi trong Git; WBS mô tả đủ công việc |

## 3. Trình tự thực hiện

1. Chuẩn bị mô hình VNode và cấu trúc file.
2. Hoàn thành factory và typeguard, sau đó lưu commit thứ nhất.
3. Hoàn thành renderer, props, sự kiện và mount DOM.
4. Chạy test, kiểm tra payload XSS và audit Elements/Console.
5. Lưu commit thứ hai và kiểm tra lịch sử Git.

## 4. Checklist đối chiếu yêu cầu

- [ ] Có đủ ba hàm tự viết: `createElement`, `createTextElement`, `renderToDOM`.
- [ ] Output dùng `main`, `section`, `button`, không có div-soup.
- [ ] Chuỗi `<script>alert(1)</script>` truyền qua child được render thành text an toàn.
- [ ] Typeguard từ chối dữ liệu sai cấu trúc.
- [ ] Đã mở Elements để đối chiếu DOM với VNode, không có node thừa hoặc thiếu.
- [ ] Console không có assertion thất bại; nút Click hoạt động.
- [ ] Commit thứ nhất có message `feat(core): implement createElement factory` và chứa factory hoàn chỉnh.
- [ ] Commit thứ hai có message `feat(core): implement renderToDOM` và chứa renderer cùng các file chạy thử.

Checklist dùng để xác nhận khi bàn giao; các ô không tự thể hiện trạng thái đã hoàn thành.
