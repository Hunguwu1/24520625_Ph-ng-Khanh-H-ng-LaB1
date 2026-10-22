export function createVisualizer(
    audioContext: AudioContext,
    canvas: HTMLCanvasElement,
) {
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Trình duyệt không hỗ trợ Canvas 2D.');
    }

    const analyser = audioContext.createAnalyser();

    // fftSize = 512 tương ứng với 256 bin tần số.
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;

    // Chỉ nối ra loa một lần khi tạo bộ phân tích.
    analyser.connect(audioContext.destination);

    // Tạo mảng một lần, dùng lại cho mọi khung hình.
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);

    let animationId: number | null = null;

    const clear = (): void => {
        context.fillStyle = '#0b1020';
        context.fillRect(0, 0, canvas.width, canvas.height);
    };

    const draw = (): void => {
        analyser.getByteFrequencyData(frequencyData);
        clear();

        const barWidth = canvas.width / frequencyData.length;

        for (let i = 0; i < frequencyData.length; i++) {
            // Dữ liệu nằm trong khoảng 0–255.
            const barHeight =
                (frequencyData[i] / 255) * canvas.height;

            context.fillStyle = '#38bdf8';
            context.fillRect(
                i * barWidth,
                canvas.height - barHeight,
                Math.max(1, barWidth - 1),
                barHeight,
            );
        }

        animationId = requestAnimationFrame(draw);
    };

    const stop = (): void => {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        clear();
    };

    const start = (): void => {
        // Dừng vòng cũ trước khi bắt đầu để tránh vẽ trùng.
        stop();
        draw();
    };

    const dispose = (): void => {
        stop();
        analyser.disconnect();
    };

    return { analyser, start, stop, dispose };
}
