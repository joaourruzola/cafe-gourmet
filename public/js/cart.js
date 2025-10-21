const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const fetchJSON = async (url, options = {}) => {
	const res = await fetch(url, options);
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`HTTP ${res.status}: ${text}`);
	}
	return res.json();
};

const formatarMoeda = (value) => `R$ ${parseFloat(value || 0).toFixed(2)}`;

const alternarPopup = (popup) => popup.classList.toggle("active");
const fecharPopup = (popup) => popup.classList.remove("active");

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

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

		if (data.success) {
			await atualizarCarrinho();
			alert("✅ " + data.message);
		} else {
			alert("❌ Erro: " + (data.message || "Falha ao adicionar"));
		}
	} catch (err) {
		console.error("Erro ao adicionar ao carrinho:", err);
		alert("⚠️ Erro de rede ou servidor");
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
		if (!data || !data.success) return;

		renderizarCarrinho(data.items);
		atualizarTotalandQuantidade(data.items);
	} catch (err) {
		console.error("Erro ao atualizar carrinho:", err);
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

		if (result.success) {
			await atualizarCarrinho();
			alert("✅ " + result.message);
		} else {
			alert(result.message || "Erro ao remover item");
		}
	} catch (err) {
		console.error("Erro ao remover item:", err);
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

		if (data.success) {
			// Atualiza a interface do carrinho com os novos dados
			await atualizarCarrinho();
			// Não exibe um alerta, pois a atualização visual já é o feedback
		} else {
			alert(
				"❌ Erro ao atualizar: " +
					(data.message || "Falha ao atualizar quantidade")
			);
			// Força uma atualização para reverter o estado visual em caso de falha
			await atualizarCarrinho();
		}
	} catch (err) {
		console.error("Erro ao atualizar quantidade do carrinho:", err);
		alert("⚠️ Erro de rede ou servidor");
		// Força uma atualização para reverter o estado visual em caso de falha
		await atualizarCarrinho();
	}
}

/* --- Handler para botões de quantidade no Popup do Carrinho --- */
function handlerQuantidadePopup() {
	const cartItems = qs(".cart-items");
	if (!cartItems) return;

	cartItems.addEventListener("click", async (e) => {
		const target = e.target;

		// Verifica se o clique foi em um dos botões de quantidade
		if (
			!target.classList.contains("btn-plus") &&
			!target.classList.contains("btn-minus")
		) {
			return;
		}

		e.preventDefault();

		// Encontra o seletor de quantidade
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
			// Se for tentar diminuir para 0, o botão "Remover" deve ser usado,
			// então definimos o mínimo como 1 para este handler.
			novaQuantidade = clamp(val - 1, 1, Infinity);
		}

		// Se a quantidade mudou, chama a API
		if (novaQuantidade !== val) {
			// Atualiza visualmente *antes* da chamada para dar uma resposta mais rápida ao usuário (otimista)
			input.value = novaQuantidade;

			// Chama a função que comunica com o servidor e atualiza o carrinho.
			await atualizarQuantidadeCarrinho(id_produto, novaQuantidade);
		}
		// Se a nova quantidade for igual à anterior (ex: tentou ir para 0 no btn-minus),
		// nenhuma ação é tomada (o item deve ser removido pelo botão "Remover").
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
