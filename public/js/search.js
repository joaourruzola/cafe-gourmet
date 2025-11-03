document.addEventListener("DOMContentLoaded", () => {
	const searchInput = document.getElementById("searchInput");
	const productCards = document.querySelectorAll(".product-card");
	const productList = document.getElementById("productList");
	const navbar = document.querySelector(".navbar");

	searchInput.addEventListener("focus", () => {
		if (!productList) return;

		let navbarHeight = 0;
		if (navbar) {
			navbarHeight = navbar.offsetHeight;
		}

		const productListTopPosition =
			productList.getBoundingClientRect().top + window.scrollY;
		const targetScrollPosition = productListTopPosition - navbarHeight - 10;

		window.scrollTo({
			top: targetScrollPosition,
			behavior: "smooth",
		});
	});

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
