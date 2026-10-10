// Ghi nhớ handler của từng phần tử.
const clickHandlers = new WeakMap();

// Ghi nhớ những root đã được gắn listener.
const attachedRoots = new WeakSet();

export function registerClickHandler(element, handler) {
    clickHandlers.set(element, handler);
}

export function attachEventHub(root) {
    // Render lại nhiều lần vẫn chỉ gắn listener một lần.
    if (attachedRoots.has(root)) {
        return;
    }

    root.addEventListener("click", event => {
        let element = event.target;

        // Tìm phần tử gần nhất có handler.
        while (element) {
            const handler = clickHandlers.get(element);

            if (handler) {
                handler.call(element, event);
                return;
            }

            if (element === root) {
                break;
            }

            element = element.parentNode;
        }
    });

    attachedRoots.add(root);
}