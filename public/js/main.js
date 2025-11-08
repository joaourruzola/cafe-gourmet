import { qs, alternarPopup, fecharPopup, clamp } from "./utils/helpers.mjs";

import {
	atualizarCarrinho,
	adicionarCarrinho,
	removerItemCarrinho,
	alterarQuantidadeBtn,
	atualizarQuantidadeCarrinho,
} from "./cart.mjs";

/* --- Popup carrinho de compras --- */
function inicializarPopupCarrinho() {
	const cart = qs(".cart");
	const popup = qs(".cart-popup");
	const closeBtn = qs(".close-cart-btn");

	if (!cart || !popup) return;

	cart.addEventListener("click", (e) => {
		e.preventDefault();
		alternarPopup(popup);
	});

	if (closeBtn) {
		closeBtn.addEventListener("click", (e) => {
			e.preventDefault();
			fecharPopup(popup);
		});
	}

	document.addEventListener("click", (e) => {
		if (
			popup.classList.contains("active") &&
			!cart.contains(e.target) &&
			!popup.contains(e.target)
		) {
			fecharPopup(popup);
		}
	});

	popup.addEventListener("click", (e) => {
		e.stopPropagation();
	});
}

/* --- Listagem de itens --- */
function listarProdutos() {
	const productList = qs("#productList");
	if (!productList) return;

	productList.addEventListener("click", (event) => {
		const target = event.target;

		if (
			target.classList.contains("btn-plus") ||
			target.classList.contains("btn-minus")
		) {
			alterarQuantidadeBtn(target);
			return;
		}

		if (target.classList.contains("add-to-cart-btn")) {
			const card = target.closest(".card");
			if (!card) return;

			const id_produto = target.dataset.productId;
			const quantidadeInput = qs(".quantity-input", card);
			const quantidade = quantidadeInput ? quantidadeInput.value : "1";

			adicionarCarrinho(id_produto, quantidade);
		}
	});
}

/* --- Remover itens do carrinho --- */
function handlerRemover() {
	const cartItems = qs(".cart-items");
	if (!cartItems) return;

	cartItems.addEventListener("click", async (e) => {
		const target = e.target;
		if (target.classList.contains("remove-btn")) {
			e.preventDefault();
			await removerItemCarrinho(target);
		}
	});
}

/* --- Handler para botões de quantidade no Popup do Carrinho --- */
function handlerQuantidadePopup() {
	const cartItems = qs(".cart-items");
	if (!cartItems) return;

	cartItems.addEventListener("click", async (e) => {
		const target = e.target;

		if (
			!target.classList.contains("btn-plus") &&
			!target.classList.contains("btn-minus")
		) {
			return;
		}

		e.preventDefault();

		const quantitySelector = target.closest(".quantity-selector");
		if (!quantitySelector) return;

		const input = qs(".quantity-input", quantitySelector);
		const id_produto = target.dataset.id;

		if (!input || !id_produto) return;

		let val = parseInt(input.value || "0", 10);
		let novaQuantidade = val;

		// Calcula a nova quantidade
		if (target.classList.contains("btn-plus")) {
			novaQuantidade = val + 1;
		} else if (target.classList.contains("btn-minus")) {
			novaQuantidade = clamp(val - 1, 1, Infinity);
		}

		// Se a quantidade mudou, chama a API
		if (novaQuantidade !== val) {
			input.value = novaQuantidade;

			await atualizarQuantidadeCarrinho(id_produto, novaQuantidade);
		}
	});
}

/* --- Página de Detalhes do Produto --- */
function inicializarPaginaDetalhes() {
	const page = qs(".product-details-page");
	if (!page) return;

	page.addEventListener("click", (event) => {
		const target = event.target;

		if (
			target.classList.contains("btn-plus") ||
			target.classList.contains("btn-minus")
		) {
			alterarQuantidadeBtn(target);
		}
	});

	const form = qs(".add-to-cart-form", page);
	if (!form) return;

	form.addEventListener("submit", (event) => {
		event.preventDefault();

		const id_produto = form.dataset.productId;
		const quantidadeInput = qs(".quantity-input", form);
		const quantidade = quantidadeInput ? quantidadeInput.value : "1";
		adicionarCarrinho(id_produto, quantidade);
	});
}

function redirectToCheckout() {
	const checkout = qs(".checkout-btn");
	if (!checkout) return;
	if (checkout) {
		checkout.addEventListener("click", (e) => {
			e.preventDefault();
			window.location.href = "/checkout";
		});
	}
}

function toggleDropdown(event) {
	event.preventDefault();
	const dropdown = qs("#accountDropdown");
	if (dropdown) {
		dropdown.classList.toggle("show");
	}
}

/* --- Inicializar helpers depois de carregado DOM --- */
document.addEventListener("DOMContentLoaded", () => {
	inicializarPopupCarrinho();
	listarProdutos();
	inicializarPaginaDetalhes();
	handlerRemover();
	handlerQuantidadePopup();
	redirectToCheckout();
	atualizarCarrinho();
});
