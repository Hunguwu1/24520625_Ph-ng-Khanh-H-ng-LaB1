import { createElement } from "./mini-react.js";
import { useState } from "./reactive-engine.js";

let nextTaskId = 3;

const filterOptions = [
    { value: "ALL", label: "Tất cả" },
    { value: "ACTIVE", label: "Chưa hoàn thành" },
    { value: "COMPLETED", label: "Đã hoàn thành" },
];

export function TaskApp() {
    const [tasks, setTasks] = useState([
        { id: 1, title: "Review PR", completed: false },
        { id: 2, title: "Verify AST", completed: false },
    ]);

    const [filter, setFilter] = useState("ALL");

    function addTask() {
        const id = nextTaskId++;

        const newTask = {
            id,
            title: `Công việc ${id}`,
            completed: false,
        };

        setTasks(previous => [...previous, newTask]);
    }

    function toggleTask(id) {
        setTasks(previous =>
            previous.map(task =>
                task.id === id
                    ? { ...task, completed: !task.completed }
                    : task
            )
        );
    }

    function deleteTask(id) {
        setTasks(previous =>
            previous.filter(task => task.id !== id)
        );
    }

    // Tính danh sách hiển thị từ tasks và filter.
    const visibleTasks = tasks.filter(task => {
        if (filter === "ACTIVE") {
            return !task.completed;
        }

        if (filter === "COMPLETED") {
            return task.completed;
        }

        return true;
    });

    return createElement(
        "main",
        { className: "app-container" },

        createElement("h1", null, "Task Manager"),

        createElement("p", null, `Tổng số công việc: ${tasks.length}`),

        createElement(
            "button",
            { type: "button", onClick: addTask },
            "Thêm công việc"
        ),

        createElement(
            "nav",
            { "aria-label": "Bộ lọc công việc" },
            filterOptions.map(option =>
                createElement(
                    "button",
                    {
                        type: "button",
                        "aria-pressed": String(filter === option.value),
                        onClick: () => setFilter(option.value),
                    },
                    filter === option.value
                        ? `[${option.label}]`
                        : option.label
                )
            )
        ),

        createElement(
            "ul",
            null,
            visibleTasks.length === 0
                ? createElement("li", null, "Không có công việc phù hợp.")
                : visibleTasks.map(task =>
                    createElement(
                        "li",
                        null,

                        createElement(
                            "span",
                            null,
                            `${task.completed ? "✓" : "○"} ${task.title} `
                        ),

                        createElement(
                            "button",
                            {
                                type: "button",
                                onClick: () => toggleTask(task.id),
                            },
                            task.completed ? "Làm lại" : "Hoàn thành"
                        ),

                        createElement(
                            "button",
                            {
                                type: "button",
                                onClick: () => deleteTask(task.id),
                            },
                            "Xóa"
                        )
                    )
                )
        )
    );
}