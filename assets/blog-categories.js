window.addEventListener("DOMContentLoaded", () => {
	const categorySelector = document.querySelector(".js-blog-categories");

	if (categorySelector) {
		categorySelector.addEventListener("change", () => {
			const options = categorySelector.options;
			let redirectLink = options[categorySelector.selectedIndex].getAttribute("target");
			window.location.href = redirectLink;
		});
	}
});
