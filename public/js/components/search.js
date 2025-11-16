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

	/**
	 * BUG 1 CORRIGIDO:
	 * Função auxiliar para normalizar texto:
	 * 1. Converte para minúsculas.
	 * 2. Remove espaços em branco extras (trim).
	 * 3. Decompõe acentos (NFD).
	 * 4. Remove os diacríticos (acentos) usando regex.
	 */
	const normalizeText = (text) => {
		if (typeof text !== "string") return "";
		return text
			.toLowerCase()
			.trim()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "");
	};

	searchInput.addEventListener("input", (event) => {
		// Normaliza o termo de pesquisa
		const searchTerm = normalizeText(event.target.value);

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

			// Normaliza o nome do produto
			const normalizedProductName = normalizeText(productName);

			if (normalizedProductName.includes(searchTerm)) {
				card.style.display = "flex";
			} else {
				card.style.display = "none";
			}
		});
	});
});
