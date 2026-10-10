import { attachEventHub } from "./event-hub.js";
import { renderToDOM } from "./mini-react.js";

// Giữ dữ liệu giữa những lần render.
const stateStore = [];
let refCursor = 0;

// Ghi nhớ component và root để render lại.
let appComponent = null;
let appRoot = null;

export function useState(initialValue) {
    // Mỗi lần gọi useState nhận một vị trí riêng.
    const index = refCursor;
    refCursor++;

    // Chỉ khởi tạo khi vị trí này chưa có state.
    if (!Object.hasOwn(stateStore, index)) {
        stateStore[index] = initialValue;
    }

    function setState(nextValue) {
        const previousValue = stateStore[index];

        // Cho phép truyền giá trị hoặc hàm cập nhật.
        const newValue =
            typeof nextValue === "function"
                ? nextValue(previousValue)
                : nextValue;

        stateStore[index] = newValue;

        // Cập nhật giao diện sau khi state thay đổi.
        renderApp();
    }

    return [stateStore[index], setState];
}

export function renderApp(
    component = appComponent,
    root = appRoot
) {
    if (typeof component !== "function" || !root) {
        throw new Error("Cần truyền component và root khi khởi động.");
    }

    appComponent = component;
    appRoot = root;
    attachEventHub(appRoot);

    // Đọc lại các state theo thứ tự từ vị trí 0.
    refCursor = 0;

    const vnode = appComponent();
    const dom = renderToDOM(vnode);

    appRoot.replaceChildren(dom);
}