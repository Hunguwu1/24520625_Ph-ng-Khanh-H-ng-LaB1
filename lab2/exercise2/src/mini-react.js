import { registerClickHandler } from "./event-hub.js";
const TEXT_ELEMENT = "TEXT_ELEMENT";
const TAG_NAME = /^[a-z][a-z0-9-]*$/;

function isObject(value) {
    return value !== null &&
        typeof value === "object" &&
        !Array.isArray(value);
}

function isText(value) {
    return typeof value === "string" ||
        (typeof value === "number" && Number.isFinite(value));
}

export function isVNode(value) {
    if (!isObject(value) || !isObject(value.props)) {
        return false;
    }

    const { type, props } = value;

    if (!Array.isArray(props.children)) {
        return false;
    }

    if (type === TEXT_ELEMENT) {
        return typeof props.nodeValue === "string" &&
            props.children.length === 0;
    }

    return typeof type === "string" &&
        TAG_NAME.test(type) &&
        props.children.every(isVNode);
}

export function createTextElement(value) {
    if (!isText(value)) {
        throw new TypeError("Text phải là string hoặc số hữu hạn");
    }

    return {
        type: TEXT_ELEMENT,
        props: {
            nodeValue: String(value),
            children: [],
        },
    };
}

export function createElement(type, props, ...children) {
    if (typeof type !== "string" || !TAG_NAME.test(type)) {
        throw new TypeError("type phải là tên thẻ HTML hợp lệ");
    }

    if (props != null && !isObject(props)) {
        throw new TypeError("props phải là object hoặc null");
    }

    if (props && Object.hasOwn(props, "children")) {
        throw new TypeError(
            "Truyền children qua các đối số phía sau props"
        );
    }

    const normalizedChildren = children
        .flat(Infinity)
        .filter(child => child != null && typeof child !== "boolean")
        .map(child => {
            if (isText(child)) {
                return createTextElement(child);
            }

            if (isVNode(child)) {
                return child;
            }

            throw new TypeError(
                "Child phải là text, number hoặc VNode hợp lệ"
            );
        });

    return {
        type,
        props: {
            ...(props ?? {}),
            children: normalizedChildren,
        },
    };
}

export function renderToDOM(vnode) {
    if (!isVNode(vnode)) {
        throw new TypeError("renderToDOM cần một VNode hợp lệ");
    }

    const { type, props } = vnode;

    // Hiển thị chuỗi HTML như text, không thực thi HTML.
    if (type === TEXT_ELEMENT) {
        return document.createTextNode(props.nodeValue);
    }

    const element = document.createElement(type);

    for (const [name, value] of Object.entries(props)) {
        if (name === "children") {
            continue;
        }

        // Ví dụ: onClick → click.
        if (/^on/i.test(name)) {
            if (typeof value !== "function") {
                throw new TypeError(`${name} phải là function`);
            }

            const eventName = name.slice(2).toLowerCase();

            if (eventName !== "click") {
                throw new Error(`Event Hub chưa hỗ trợ sự kiện: ${eventName}`);
            }

            registerClickHandler(element, value);
            continue;
        }

        if (value == null) {
            continue;
        }

        if (!isText(value)) {
            throw new TypeError(
                `${name} phải là string hoặc số hữu hạn`
            );
        }

        const attributeName = name === "className" ? "class" : name;
        element.setAttribute(attributeName, String(value));
    }

    // Chuyển từng child thành DOM rồi gắn vào element cha.
    for (const child of props.children) {
        element.appendChild(renderToDOM(child));
    }

    return element;
}