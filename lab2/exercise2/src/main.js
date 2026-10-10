import { createElement } from "./mini-react.js";
import { useState, renderApp } from "./reactive-engine.js";

function CounterApp() {
    const [count, setCount] = useState(0);

    return createElement(
        "main",
        null,
        createElement("h1", null, `Số lần nhấn: ${count}`),
        createElement(
            "button",
            {
                onClick: () => setCount(previous => previous + 1),
            },
            "Tăng"
        )
    );
}

const root = document.getElementById("app");
renderApp(CounterApp, root);