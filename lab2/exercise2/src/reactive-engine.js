// Lưu các giá trị state giữa những lần render.
const stateStore = [];

// Xác định vị trí state của mỗi lần gọi useState.
let refCursor = 0;