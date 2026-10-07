const contactForm = document.querySelector("#contact-form");
const contactStatus = document.querySelector("#contact-status");

contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    contactStatus.textContent =
        "Dữ liệu hợp lệ; đây là form demo, chưa gửi tin nhắn.";
});

contactForm.addEventListener("input", () => {
    contactStatus.textContent = "";
});