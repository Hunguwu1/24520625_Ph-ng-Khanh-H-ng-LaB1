export function createAntiDriftTimer(
    endsAt: number,
    onTick: (remainingMs: number) => void,
): () => void {
    let frameId: number | undefined
    let stopped = false

    function tick(): void {
        if (stopped) {
            return
        }

        const remainingMs = Math.max(0, endsAt - Date.now())

        onTick(remainingMs)

        if (remainingMs > 0 && !stopped) {
            frameId = requestAnimationFrame(tick)
        }
    }

    // Hiển thị ngay, không chờ khung hình tiếp theo.
    tick()

    // Trả về hàm để bên gọi có thể dừng đồng hồ.
    return () => {
        stopped = true

        if (frameId !== undefined) {
            cancelAnimationFrame(frameId)
        }
    }
}

export function formatCountdown(remainingMs: number): string {
    const totalMs = Math.max(0, Math.floor(remainingMs))

    const minutes = Math.floor(totalMs / 60_000)
    const seconds = Math.floor(totalMs / 1000) % 60
    const milliseconds = totalMs % 1000

    const minuteText = String(minutes).padStart(2, '0')
    const secondText = String(seconds).padStart(2, '0')
    const millisecondText = String(milliseconds).padStart(3, '0')

    return `${minuteText}:${secondText}.${millisecondText}`
}