const eventTimeElement = document.querySelector("#event-time");
const eventTime = Date.parse(eventTimeElement.dateTime);

const daysElement = document.querySelector("#days");
const hoursElement = document.querySelector("#hours");
const minutesElement = document.querySelector("#minutes");
const secondsElement = document.querySelector("#seconds");
const countdownMessage = document.querySelector("#countdown-message");

function formatNumber(value) {
    return String(value).padStart(2, "0");
}

function updateCountdown() {
    const remaining = Math.max(0, eventTime - Date.now());
    const totalSeconds = Math.ceil(remaining / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    daysElement.textContent = formatNumber(days);
    hoursElement.textContent = formatNumber(hours);
    minutesElement.textContent = formatNumber(minutes);
    secondsElement.textContent = formatNumber(seconds);

    const message = remaining > 0
        ? "Counting down to UIT Tech Day."
        : "The event has started.";

    if (countdownMessage.textContent !== message) {
        countdownMessage.textContent = message;
    }

    return remaining > 0;
}

/* Start only when the timestamp is valid and still in the future */
if (Number.isNaN(eventTime)) {
    countdownMessage.textContent = "The event time is unavailable.";
} else if (updateCountdown()) {
    const timerId = setInterval(() => {
        const isRunning = updateCountdown();

        if (!isRunning) {
            clearInterval(timerId);
        }
    }, 1000);
}