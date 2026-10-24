const squads = {
    te: { name: "The Expendables", kills: 12 },
    ce: { name: "Cerberus Esports", kills: 8 },
};

export function fetchKraftonPubgTelemetry(squadId, { signal }) {
    return new Promise((resolve, reject) => {
        const abortRequest = () => {
            clearTimeout(timer);
            reject(new DOMException("Request cancelled", "AbortError"));
        };

        // Giả lập thời gian chờ dữ liệu là 2 giây.
        const timer = setTimeout(() => {
            signal.removeEventListener("abort", abortRequest);

            const squad = squads[squadId];

            if (!squad) {
                reject(new Error("Không tìm thấy đội."));
                return;
            }

            resolve({ ...squad });
        }, 2000);

        if (signal.aborted) {
            abortRequest();
            return;
        }

        signal.addEventListener("abort", abortRequest, { once: true });
    });
}