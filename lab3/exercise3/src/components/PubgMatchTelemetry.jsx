import { useEffect, useState } from "react";
import { fetchKraftonPubgTelemetry } from "../services/pubgApi";

export default function PubgMatchTelemetry({ squadId = "te" }) {
    const [view, setView] = useState({
        status: "IDLE",
        data: null,
        error: null,
    });

    const [retryTick, setRetryTick] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        setView({
            status: "LOADING",
            data: null,
            error: null,
        });

        fetchKraftonPubgTelemetry(squadId, {
            signal: controller.signal,
        })
            .then((payload) => {
                setView({
                    status: "SUCCESS",
                    data: payload,
                    error: null,
                });
            })
            .catch((err) => {
                // Hủy yêu cầu khi đổi đội không phải lỗi cần hiển thị.
                if (err.name === "AbortError") return;

                setView({
                    status: "ERROR",
                    data: null,
                    error: err.message,
                });
            });

        // Hủy yêu cầu cũ khi đổi đội hoặc gỡ component.
        return () => controller.abort();
    }, [squadId, retryTick]);

    if (view.status === "IDLE") {
        return <p>Chưa tải dữ liệu.</p>;
    }

    if (view.status === "LOADING") {
        return <p aria-busy="true">Đang tải dữ liệu đội...</p>;
    }

    if (view.status === "ERROR") {
        return (
            <section>
                <p>Lỗi: {view.error}</p>

                <button
                    type="button"
                    onClick={() => setRetryTick((tick) => tick + 1)}
                >
                    Reconnect Telemetry
                </button>
            </section>
        );
    }

    return (
        <article aria-live="polite">
            <h2>{view.data.name}</h2>
            <p>Kills: {view.data.kills}</p>
        </article>
    );
}