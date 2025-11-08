import {
	qs,
	fetchJSON,
	formatarMoeda,
	showToast,
	clamp,
} from "./utils/helpers.mjs";

/* --- Seleção de quantidade --- */
export function alterarQuantidadeBtn(target) {
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
export async function adicionarCarrinho(id_produto, quantidade) {
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
export async function atualizarCarrinho() {
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
export async function removerItemCarrinho(target) {
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

/* --- Atualizar quantidade do item no carrinho (servidor) --- */
export async function atualizarQuantidadeCarrinho(id_produto, quantidade) {
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
