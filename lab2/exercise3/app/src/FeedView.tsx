import { useEffect, useRef, useState } from 'react';
import type { ViewState } from './state-machine';
import './skeleton.css';

type FeedItem = {
    id: number;
    title: string;
};

// Giả lập tải dữ liệu mất 1,5 giây.
// Chỉ dùng để kiểm tra lỗi: lần tải đầu sẽ thất bại.
let simulateErrorOnce = false;

async function fetchFeed(): Promise<FeedItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (simulateErrorOnce) {
        simulateErrorOnce = false;
        throw new Error('Lỗi kết nối giả lập');
    }

    return [
        { id: 1, title: 'Project Alpha' },
        { id: 2, title: 'Project Beta' },
    ];
}

export default function FeedView() {
    const [state, setState] = useState<ViewState<FeedItem[]>>({
        status: 'IDLE',
    });
    // Ghi nhớ số thứ tự của lần tải mới nhất.
    const requestId = useRef(0);

    // Vô hiệu hóa yêu cầu đang chờ khi component bị gỡ.
    useEffect(() => {
        return () => {
            requestId.current += 1;
        };
    }, []);

    async function loadData() {
        const currentRequest = ++requestId.current;

        setState({ status: 'LOADING' });

        try {
            const items = await fetchFeed();

            // Bỏ qua kết quả nếu đã có lần tải mới hơn.
            if (currentRequest !== requestId.current) return;

            setState({ status: 'SUCCESS', data: items });
        } catch {
            // Lỗi của yêu cầu cũ cũng không được đổi giao diện.
            if (currentRequest !== requestId.current) return;

            setState({
                status: 'ERROR',
                error: 'Không thể tải dữ liệu. Vui lòng thử lại.',
            });
        }
    }

    return (
        <main>
            <p>Trạng thái hiện tại: {state.status}</p>

            <button
                type="button"
                onClick={loadData}
                disabled={state.status === 'LOADING'}
            >
                {state.status === 'ERROR'
                    ? 'Retry Connection'
                    : 'Tải dữ liệu'}
            </button>
            {state.status === 'LOADING' && (
                <div role="status">
                    <p>Đang tải dữ liệu...</p>

                    <div className="skeleton-list" aria-hidden="true">
                        <div className="skeleton-card" />
                        <div className="skeleton-card" />
                        <div className="skeleton-card" />
                    </div>
                </div>
            )}

            {state.status === 'SUCCESS' && (
                <ul>
                    {state.data.map((item) => (
                        <li key={item.id}>{item.title}</li>
                    ))}
                </ul>
            )}

            {state.status === 'ERROR' && (
                <p role="alert">{state.error}</p>
            )}
        </main>
    );

}