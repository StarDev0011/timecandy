window.addEventListener("DOMContentLoaded", () => {
	let successModal = document.querySelector(".js-article-modal");
	let modalBackground = document.querySelector(".js-modal-background");

	if (successModal && modalBackground) {
		document.body.appendChild(successModal);
		document.documentElement.appendChild(successModal);
		successModal.classList.add("animated");

		modalBackground.addEventListener("click", () => {
			successModal.style.display = "none";
		});
	}
});
