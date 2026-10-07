const themeButton = document.querySelector("#theme-btn");
const savedTheme = localStorage.getItem("theme");

const initialTheme =
    savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";

function applyTheme(theme) {
    const isDark = theme === "dark";

    document.documentElement.dataset.theme = theme;
    themeButton.setAttribute("aria-pressed", String(isDark));
    themeButton.textContent = isDark
        ? "Chuyển sang chế độ sáng ☀️"
        : "Chuyển sang chế độ tối 🌙";
}

applyTheme(initialTheme);

themeButton.addEventListener("click", () => {
    const nextTheme =
        document.documentElement.dataset.theme === "dark"
            ? "light"
            : "dark";

    applyTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
});