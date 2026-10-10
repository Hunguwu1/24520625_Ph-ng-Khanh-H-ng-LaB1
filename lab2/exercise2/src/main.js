import { TaskApp } from "./task-app.js";
import { renderApp } from "./reactive-engine.js";

const root = document.getElementById("app");

renderApp(TaskApp, root);