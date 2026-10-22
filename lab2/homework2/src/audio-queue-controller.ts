interface AudioTask {
    trackUrl: string;
    signal: AbortSignal;
    onStart: () => void;
    cleanup: () => void;
    resolve: (buffer: AudioBuffer) => void;
    reject: (error: unknown) => void;
}

export class AudioTaskQueue {
    private queue: AudioTask[] = [];
    private activeCount = 0;

    private audioContext: AudioContext;
    private maxConcurrency: number;

    constructor(audioContext: AudioContext, maxConcurrency = 2) {
        if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1) {
            throw new Error('Số tác vụ đồng thời phải là số nguyên dương.');
        }

        this.audioContext = audioContext;
        this.maxConcurrency = maxConcurrency;
    }

    enqueue(
        trackUrl: string,
        onStart: () => void,
        signal: AbortSignal,
    ): Promise<AudioBuffer> {
        return new Promise((resolve, reject) => {
            signal.throwIfAborted();

            const task: AudioTask = {
                trackUrl,
                signal,
                onStart,
                resolve,
                reject,
                cleanup: () => { },
            };

            const onAbort = (): void => {
                // Loại tác vụ đang chờ và kết thúc Promise ngay khi hủy.
                this.queue = this.queue.filter((item) => item !== task);
                task.cleanup();
                reject(signal.reason);
            };

            task.cleanup = () => {
                signal.removeEventListener('abort', onAbort);
            };

            signal.addEventListener('abort', onAbort, { once: true });

            // Thêm vào cuối hàng đợi.
            this.queue.push(task);
            this.processNext();
        });
    }

    private processNext(): void {
        while (
            this.activeCount < this.maxConcurrency &&
            this.queue.length > 0
        ) {
            // Lấy từ đầu hàng đợi: FIFO.
            const task = this.queue.shift()!;

            this.activeCount++;
            void this.runTask(task);
        }
    }

    private async runTask(task: AudioTask): Promise<void> {
        try {
            task.signal.throwIfAborted();
            task.onStart();

            const response = await fetch(task.trackUrl, {
                signal: task.signal,
            });

            if (!response.ok) {
                throw new Error(`Tải thất bại: HTTP ${response.status}`);
            }

            const audioData = await response.arrayBuffer();
            task.signal.throwIfAborted();

            const buffer =
                await this.audioContext.decodeAudioData(audioData);

            // decodeAudioData không nhận AbortSignal: bỏ kết quả nếu đã hủy.
            task.signal.throwIfAborted();
            task.resolve(buffer);
        } catch (error) {
            task.reject(error);
        } finally {
            task.cleanup();
            // Luôn nhường chỗ cho bài tiếp theo, kể cả khi có lỗi.
            this.activeCount--;
            this.processNext();
        }
    }
}
