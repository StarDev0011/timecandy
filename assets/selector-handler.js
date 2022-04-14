window.addEventListener("DOMContentLoaded", () => {
	const selector = document.querySelector(".js-selector");

	if (selector) {
		const options = selector.options;

		for (option of options) {
			if (window.location.pathname === option.getAttribute("target")) {
				selector.value = option.value;
				break;
			}
		}

		selector.addEventListener("change", () => {
			let redirectLink = options[selector.selectedIndex].getAttribute("target");
			window.location.href = redirectLink;
		});
	}
});
