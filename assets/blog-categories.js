window.addEventListener("DOMContentLoaded", () => {
	const categorySelector = document.querySelector(".js-blog-categories");

	if (categorySelector) {
		categorySelector.addEventListener("change", () => {
			let redirectLink = categorySelector.getAttribute("target");
			window.location.href = redirectLink;
		});
	}
});
