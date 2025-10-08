document.addEventListener("DOMContentLoaded", () => {
	const cart = document.querySelector(".cart");
	const popup = document.querySelector(".cart-popup");

	// Abre/fecha ao clicar
	cart.addEventListener("click", (e) => {
		e.preventDefault();
		popup.classList.toggle("active");
	});

	// Fecha se clicar fora do popup
	document.addEventListener("click", (e) => {
		if (!cart.contains(e.target)) {
			popup.classList.remove("active");
		}
	});
});
