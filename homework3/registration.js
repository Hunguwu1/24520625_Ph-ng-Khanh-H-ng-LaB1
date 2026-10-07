/* Change to true when testing the error state */
const SIMULATE_FAILURE = false;

const form = document.querySelector("#registration-form");
const fullNameInput = document.querySelector("#full-name");
const emailInput = document.querySelector("#email");
const submitButton = document.querySelector("#submit-button");
const formStatus = document.querySelector("#form-status");

let formState = "idle";

function setFormState(nextState, message = "") {
    formState = nextState;
    form.dataset.state = nextState;

    const isSubmitting = nextState === "submitting";

    form.setAttribute("aria-busy", String(isSubmitting));

    submitButton.disabled = isSubmitting;
    fullNameInput.disabled = isSubmitting;
    emailInput.disabled = isSubmitting;

    submitButton.textContent = isSubmitting
        ? "Submitting..."
        : "Register";

    formStatus.textContent = message;
}

async function simulateRegistration(data) {
    await new Promise((resolve) => {
        setTimeout(resolve, 2000);
    });

    if (SIMULATE_FAILURE) {
        throw new Error("Simulated submission failure.");
    }

    return {
        fullName: data.fullName,
    };
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    /* Ignore additional submissions while processing */
    if (formState === "submitting") {
        return;
    }

    if (!form.reportValidity()) {
        return;
    }

    const data = {
        fullName: fullNameInput.value.trim(),
        email: emailInput.value.trim(),
    };

    setFormState("submitting", "Submitting your registration...");

    try {
        const result = await simulateRegistration(data);

        setFormState(
            "success",
            `Demo submission completed for ${result.fullName}. No data was sent.`
        );
    } catch {
        setFormState(
            "error",
            "Submission failed. Please try again."
        );
    }
});

/* Enable the form after its handler is ready */
setFormState("idle");