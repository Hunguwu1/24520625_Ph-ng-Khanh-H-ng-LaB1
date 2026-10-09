import {
    createElement,
    createTextElement,
    isVNode,
    renderToDOM,
} from "./mini-react.js";

const scriptPayload = "<script>alert(1)</script>";
const imagePayload = "<img onerror=alert(1)> Safe Text";

let clicks = 0;

// 1. Tạo cây VNode bằng semantic tags.
const vApp = createElement(
    "main",
    { id: "root-view", role: "main" },

    createElement(
        "header",
        { className: "hero" },
        createElement("h1", null, "Mini React Engine")
    ),

    createElement(
        "section",
        { "aria-label": "Security checkpoint" },
        createElement("p", null, scriptPayload),
        createElement("p", null, imagePayload)
    ),

    createElement(
        "button",
        {
            onClick: () => {
                clicks += 1;
                console.log("Ping");
            },
        },
        "Click"
    )
);

// 2. Mount cây DOM.
const root = document.getElementById("app");

if (!root) {
    throw new Error('Không tìm thấy phần tử có id="app"');
}

root.replaceChildren(renderToDOM(vApp));

// 3. Kiểm tra semantic tags và props.
console.assert(
    root.firstElementChild?.tagName === "MAIN",
    "Phần tử gốc phải là main"
);

console.assert(
    root.querySelector("section") !== null,
    "Thiếu section"
);

console.assert(
    root.querySelector("button") !== null,
    "Mount Failed: thiếu button"
);

console.assert(
    root.querySelector("header")?.className === "hero",
    "className chưa chuyển thành class"
);

console.assert(
    root.querySelector("main")?.getAttribute("role") === "main",
    "Thuộc tính role chưa được gắn đúng"
);

console.assert(
    root.querySelectorAll("div").length === 0,
    "Có div thừa trong ứng dụng"
);

// 4. Kiểm tra XSS: payload phải hiển thị dưới dạng text.
const paragraphs = root.querySelectorAll("p");

console.assert(
    paragraphs[0]?.textContent === scriptPayload,
    "Script payload bị thay đổi"
);

console.assert(
    paragraphs[1]?.textContent === imagePayload,
    "Image payload bị thay đổi"
);

console.assert(
    root.querySelector("script, img") === null,
    "Payload đã trở thành element HTML"
);

// 5. Kiểm tra onClick.
root.querySelector("button")?.click();

console.assert(
    clicks === 1,
    "onClick chưa hoạt động đúng"
);

// 6. Kiểm tra typeguard.
function assertThrows(action, message) {
    let threwTypeError = false;

    try {
        action();
    } catch (error) {
        threwTypeError = error instanceof TypeError;
    }

    console.assert(threwTypeError, message);
}

console.assert(
    isVNode(vApp),
    "VNode hợp lệ bị từ chối"
);

console.assert(
    !isVNode(null),
    "Typeguard chấp nhận null"
);

console.assert(
    !isVNode({
        type: "p",
        props: { children: [{}] },
    }),
    "Typeguard chấp nhận child sai cấu trúc"
);

assertThrows(
    () => createTextElement({}),
    "createTextElement phải từ chối object"
);

assertThrows(
    () => createElement("p", null, {}),
    "createElement phải từ chối child là object không hợp lệ"
);

assertThrows(
    () => renderToDOM({}),
    "renderToDOM phải từ chối VNode không hợp lệ"
);

assertThrows(
    () => renderToDOM(
        createElement("button", { onClick: "alert(1)" }, "Click")
    ),
    "Event handler phải là function"
);

// 7. Đối chiếu toàn bộ cấu trúc VNode với DOM.
function assertTreeMatches(vnode, dom) {
    console.assert(dom != null, "Thiếu DOM node");

    if (!dom) {
        return;
    }

    if (vnode.type === "TEXT_ELEMENT") {
        console.assert(
            dom.nodeType === Node.TEXT_NODE,
            "Sai loại text node"
        );

        console.assert(
            dom.nodeValue === vnode.props.nodeValue,
            "Nội dung text không khớp"
        );

        return;
    }

    console.assert(
        dom.nodeType === Node.ELEMENT_NODE,
        "Sai loại element node"
    );

    console.assert(
        dom.localName === vnode.type,
        `Tên thẻ không khớp: cần ${vnode.type}`
    );

    const children = vnode.props.children;

    console.assert(
        dom.childNodes.length === children.length,
        `Có node thừa hoặc thiếu trong ${vnode.type}`
    );

    children.forEach((child, index) => {
        assertTreeMatches(child, dom.childNodes[index]);
    });
}

console.assert(
    root.childNodes.length === 1,
    "Mount root phải có đúng một node con"
);

assertTreeMatches(vApp, root.firstChild);