import { playSound } from "./audio-engine.js";

const pads = [...document.querySelectorAll(".drum-pad")];

// Cả click và bàn phím đều dùng hàm này.
function triggerPad(pad) {
    playSound(pad.dataset.sound);
}

// Điều khiển bằng chuột hoặc cảm ứng.
pads.forEach((pad) => {
    pad.addEventListener("click", () => {
        triggerPad(pad);
    });
});

// Điều khiển bằng bàn phím.
window.addEventListener("keydown", (event) => {
    // Bỏ qua sự kiện tự lặp khi giữ phím.
    if (event.repeat) return;

    // Không kích hoạt trống khi dùng tổ hợp phím.
    if (event.ctrlKey || event.altKey || event.metaKey) return;

    // Không đánh trống khi người dùng đang nhập dữ liệu.
    const target = event.target;

    if (
        target instanceof HTMLElement &&
        (target.matches("input, textarea, select") ||
            target.isContentEditable)
    ) {
        return;
    }

    const key = event.key.toLowerCase();

    const pad = pads.find((item) => {
        return item.dataset.key === key;
    });

    // Phím không thuộc bộ trống thì không xử lý.
    if (!pad) return;

    event.preventDefault();
    triggerPad(pad);
});