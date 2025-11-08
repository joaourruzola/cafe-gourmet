document.addEventListener("DOMContentLoaded", () => {
	const accountBtn = document.querySelector(".account-btn");
	const dropdown = document.querySelector("#accountDropdown");

	if (accountBtn && dropdown) {
		accountBtn.addEventListener("click", (event) => {
			event.preventDefault();
			dropdown.classList.toggle("show");
		});
	}

	window.addEventListener("click", (event) => {
		if (dropdown && dropdown.classList.contains("show")) {
			if (
				!accountBtn.contains(event.target) &&
				!dropdown.contains(event.target)
			) {
				dropdown.classList.remove("show");
			}
		}
	});
});
