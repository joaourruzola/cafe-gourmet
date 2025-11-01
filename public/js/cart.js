const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const fetchJSON = async (url, options = {}) => {
	const res = await fetch(url, options);
	if (!res.ok) {
		const errorData = await res.json().catch(() => null);

		if (errorData && errorData.mensagem) {
			throw new Error(errorData.mensagem);
		}

		const text = await res.text().catch(() => "");
		throw new Error(`HTTP ${res.status}: ${text}`);
	}
	return res.json();
};

const formatarMoeda = (value) => `R$ ${parseFloat(value || 0).toFixed(2)}`;

const alternarPopup = (popup) => popup.classList.toggle("active");
const fecharPopup = (popup) => popup.classList.remove("active");

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

/**
 * Exibe uma notificação Toast no canto da tela.
 * @param {string} message
 * @param {('success'|'error'|'warning')} type
 * @param {number} duration
 */

function showToast(message, type = "success", duration = 3000) {
	let container = qs("#toast-container");

	// Cria o container se não existir
	if (!container) {
		container = document.createElement("div");
		container.id = "toast-container";
		document.body.appendChild(container);
	}

	const toast = document.createElement("div");
	toast.className = `custom-toast ${type}`;
	toast.innerHTML = message;

	container.appendChild(toast);

	// Força o reflow para garantir a transição
	toast.offsetWidth;

	toast.classList.add("show");

	const timeoutId = setTimeout(() => {
		toast.classList.remove("show");
		toast.addEventListener("transitionend", () => toast.remove());
	}, duration);

	toast.addEventListener("click", () => {
		clearTimeout(timeoutId);
		toast.classList.remove("show");
		toast.addEventListener("transitionend", () => toast.remove(), {
			once: true,
		});
	});
}

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

/* --- Seleção de quantidade --- */
function alterarQuantidadeBtn(target) {
	const quantitySelector = target.closest(".quantity-selector");
	if (!quantitySelector) return;

	const input = qs(".quantity-input", quantitySelector);
	if (!input) return;

	const min = parseInt(input.getAttribute("min") || "0", 10);
	const max = parseInt(input.getAttribute("max") || "9999", 10);
	let val = parseInt(input.value || "0", 10);

	if (target.classList.contains("btn-plus")) {
		val = clamp(val + 1, min, max);
	} else if (target.classList.contains("btn-minus")) {
		val = clamp(val - 1, min, max);
	}

	input.value = val;
}

/* --- Botão Comprar --- */
async function adicionarCarrinho(id_produto, quantidade) {
	try {
		const data = await fetchJSON("/carrinho/adicionar", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id_produto, quantidade }),
		});

		if (data.status === "sucesso") {
			await atualizarCarrinho();
			showToast(`✅ ${data.mensagem || "Item adicionado!"}`, "success");
		} else {
			showToast(
				`❌ Erro: ${data.mensagem || "Falha ao adicionar"}`,
				"error"
			);
		}
	} catch (err) {
		console.error("Erro ao adicionar ao carrinho:", err);
		showToast(
			`⚠️ Erro: ${err.message || "Erro de rede ou servidor"}`,
			"error"
		);
	}
}

/* --- Renderiza os itens do carrinho --- */
function renderizarCarrinho(items) {
	const cartItemsEl = qs(".cart-items");
	if (!cartItemsEl) return;

	cartItemsEl.innerHTML = "";

	if (!items || items.length === 0) {
		cartItemsEl.innerHTML = `<p class="empty-cart">Seu carrinho está vazio.</p>`;

		qs(".cart-summary").style.display = "none";
		qs(".checkout-btn").style.display = "none";
		return;
	}

	qs(".cart-summary").style.display = "block";
	qs(".checkout-btn").style.display = "block";

	items.forEach((item) => {
		const itemEl = document.createElement("div");
		itemEl.className = "cart-item";
		itemEl.dataset.itemId = item.id_produto; // Adiciona ID ao elemento principal

		itemEl.innerHTML = `
            <img src="/images/${item.imagem}" alt="${
			item.nome
		}" class="cart-item-image" />
            <div class="cart-item-details">
                <div class="cart-item-header">
                    <span class="cart-item-name">${item.nome}</span>
                    <span class="cart-item-price">${formatarMoeda(
						item.valor_unitario * item.quantidade
					)}</span>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-selector">
                        <button class="quantity-btn btn-minus" data-id="${
							item.id_produto
						}">-</button>
                        <input type="text" class="quantity-input" value="${
							item.quantidade
						}" readonly />
                        <button class="quantity-btn btn-plus" data-id="${
							item.id_produto
						}">+</button>
                    </div>
                    <button class="remove-btn" data-id="${
						item.id_produto
					}">Remover</button>
                </div>
            </div>
        `;

		cartItemsEl.appendChild(itemEl);
	});
}

/* --- Atualizar total e contagem --- */
function atualizarTotalandQuantidade(items) {
	const totalEl = qs("#cart-total");
	const countEl = qs(".cart-count");

	let total = 0;
	let totalItens = 0;

	(items || []).forEach((item) => {
		total +=
			(parseFloat(item.valor_unitario) || 0) *
			(parseInt(item.quantidade, 10) || 0);
		totalItens += parseInt(item.quantidade, 10) || 0;
	});

	if (totalEl) totalEl.textContent = formatarMoeda(total);
	if (countEl) countEl.textContent = totalItens > 0 ? totalItens : 0;
}

/* --- Atualizar carrinho --- */
async function atualizarCarrinho() {
	try {
		const data = await fetchJSON("/carrinho/atual");
		if (data.status === "sucesso" && data.itens) {
			renderizarCarrinho(data.itens);
			atualizarTotalandQuantidade(data.itens);
			return;
		}

		if (data.status === "erro") {
			showToast(`❌ ${data.mensagem}`, "error");
		}
	} catch (err) {
		console.error("Erro ao atualizar carrinho:", err);
		showToast(
			`⚠️ Erro ao carregar: ${err.message || "Servidor indisponível"}`,
			"error"
		);

		renderizarCarrinho([]);
		atualizarTotalandQuantidade([]);
	}
}

/* --- Remover item --- */
async function removerItemCarrinho(target) {
	const id_produto = target.dataset.id;
	if (!id_produto) return;

	try {
		const result = await fetchJSON(`/carrinho/remover/${id_produto}`, {
			method: "DELETE",
		});

		if (result.status === "sucesso") {
			await atualizarCarrinho();
			showToast(`✅ ${result.mensagem || "Item removido!"}`, "success");
		}
	} catch (err) {
		console.error("Erro ao remover item:", err);
		showToast(
			`⚠️ Erro: ${err.message || "Erro de rede ou servidor"}`,
			"error"
		);
	}
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

/* --- Atualizar quantidade do item no carrinho (servidor) --- */
async function atualizarQuantidadeCarrinho(id_produto, quantidade) {
	try {
		const data = await fetchJSON("/carrinho/atualizar", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id_produto, quantidade }),
		});

		if (data.status === "sucesso") {
			await atualizarCarrinho();
		}
	} catch (err) {
		console.error("Erro ao atualizar quantidade do carrinho:", err);
		showToast(
			`❌ Erro: ${err.message || "Falha ao atualizar quantidade"}`,
			"error"
		);

		await atualizarCarrinho();
	}
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

/* --- Inicializar helpers depois de carregado DOM --- */
document.addEventListener("DOMContentLoaded", () => {
	inicializarPopupCarrinho();
	listarProdutos();
	handlerRemover();
	handlerQuantidadePopup();
	atualizarCarrinho();
	redirectToCheckout();
});
