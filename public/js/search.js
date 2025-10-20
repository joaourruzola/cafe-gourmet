document.addEventListener("DOMContentLoaded", () => {
	const searchInput = document.getElementById("searchInput");
	const productCards = document.querySelectorAll(".product-card");

	searchInput.addEventListener("input", (event) => {
		const searchTerm = event.target.value.toLowerCase().trim();

		// Itera sobre todos os cards de produto
		productCards.forEach((card) => {
			const productNameElement = card.querySelector(".textos p");

			let productName = "";
			if (productNameElement) {
				productName =
					productNameElement.textContent ||
					productNameElement.innerText;
				const productImage = card.querySelector("img");
				productName = productImage ? productImage.alt : productName;
			}
			const normalizedProductName = productName.toLowerCase();

			if (normalizedProductName.includes(searchTerm)) {
				card.style.display = "flex";
			} else {
				card.style.display = "none";
			}
		});
	});
});
