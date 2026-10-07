# TASK_DECOMPOSITION

## State Machine Definition (4 States)
1. **Loading Skeleton (T-03A)**: Trạng thái chờ tải dữ liệu, hiển thị khung skeleton với hiệu ứng shimmer (Pure CSS).
2. **Live Data State (T-03B)**: Trạng thái dữ liệu tải thành công, hiển thị danh sách metadata badges bằng Flexbox và Grid.
3. **Empty State (T-03C)**: Trạng thái không có dữ liệu, hiển thị thông báo trống và nút ""Thử lại"" (accessible retry trigger).
4. **Error State (T-03C)**: Trạng thái lỗi tải dữ liệu, hiển thị thông báo lỗi kèm nút ""Thử lại"" (accessible retry trigger).
