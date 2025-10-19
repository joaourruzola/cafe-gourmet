document.addEventListener("DOMContentLoaded", () => {
	const radios = document.querySelectorAll("input[name='payment']");
	const forms = document.querySelectorAll(".payment-form");

	radios.forEach((radio) => {
		radio.addEventListener("change", () => {
			forms.forEach((f) => f.classList.add("hidden"));
			document
				.querySelector(`#${radio.value}-form`)
				.classList.remove("hidden");
		});
	});
});
