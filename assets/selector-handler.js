window.addEventListener("DOMContentLoaded", () => {
	const selector = document.querySelector(".js-selector");

	if (selector) {
		const options = selector.options;

		selector.addEventListener("change", () => {
			let redirectLink = options[selector.selectedIndex].getAttribute("target");
			window.location.href = redirectLink;
		});
	}
});
