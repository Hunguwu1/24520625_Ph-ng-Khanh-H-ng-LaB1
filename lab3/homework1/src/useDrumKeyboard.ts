import { useEffect } from "react";

export type DrumPad = {
    id: string;
    name: string;
    key: string;
    code: string;
    src: string;
};

export function useDrumKeyboard(
    padMap: Map<string, DrumPad>,
    onTriggerPad: (pad: DrumPad) => void,
    isEnabled = true
) {
    useEffect(() => {
        if (!isEnabled) return;

        function onKeyDown(event: KeyboardEvent) {
            // Giữ phím chỉ phát một lần.
            if (event.repeat) return;

            // Không chiếm các tổ hợp phím.
            if (event.ctrlKey || event.altKey || event.metaKey) return;

            const target = event.target;

            // Không phát trống khi đang nhập liệu.
            if (
                target instanceof HTMLElement &&
                (target.closest("input, textarea, select") ||
                    target.isContentEditable)
            ) {
                return;
            }

            const pad = padMap.get(event.code);
            if (!pad) return;

            event.preventDefault();
            onTriggerPad(pad);
        }

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [padMap, onTriggerPad, isEnabled]);
}