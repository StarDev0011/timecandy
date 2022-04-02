window.addEventListener("DOMContentLoaded", () => {
	const newsletterInput = document.querySelector(".js-newsletter-input");
	const tooltip = document.querySelector(".js-newsletter-tooltip");

	if (newsletterInput && tooltip) {
		const newsletterInputContainer = newsletterInput.parentElement;
		newsletterInput.addEventListener("blur", () => {
			const value = newsletterInput.value;
			const validMail = value.match(/.*@.*\..*/);

			if (!value) {
				newsletterInputContainer.classList.add("error");
				tooltip.textContent = "This field is required";
			} else if (!validMail) {
				newsletterInputContainer.classList.add("error");
				tooltip.textContent = "Please enter a valid email address";
			} else {
				newsletterInputContainer.classList.remove("error");
				tooltip.textContent = "";
			}
		});
	}
});
