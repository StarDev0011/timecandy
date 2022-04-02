window.addEventListener("DOMContentLoaded", () => {
	const newsletterInput = document.querySelector(".js-newsletter-input");

	if (newsletterInput) {
		const newsletterInputContainer = newsletterInput.parentElement;

		newsletterInput.addEventListener("blur", () => {
			if (!newsletterInput.value) {
				newsletterInputContainer.classList.add("error");
			} else {
				newsletterInputContainer.classList.remove("error");
			}
		});
	}
});
