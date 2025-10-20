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

const formatCurrency = (value) => `R$ ${parseFloat(value || 0).toFixed(2)}`;

const togglePopup = (popup) => popup.classList.toggle("active");
const closePopup = (popup) => popup.classList.remove("active");

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

/* --- Cart popup behavior --- */
function initCartPopup() {
    const cart = qs(".cart");
    const popup = qs(".cart-popup");
    if (!cart || !popup) return;

    cart.addEventListener("click", (e) => {
        e.preventDefault();
        togglePopup(popup);
    });

    document.addEventListener("click", (e) => {
        if (!cart.contains(e.target)) closePopup(popup);
    });
}

/* --- Quantity controls --- */
function handleQuantityButtonClick(target) {
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

/* --- Add to cart --- */
async function addToCart(id_produto, quantidade) {
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

/* --- Render cart items --- */
function renderCartItems(items) {
    const cartItemsEl = qs(".cart-items");
    if (!cartItemsEl) return;

    cartItemsEl.innerHTML = "";

    if (!items || items.length === 0) {
        cartItemsEl.innerHTML = `<p class="empty-cart">Carrinho vazio</p>`;
        return;
    }

    items.forEach((item) => {
        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
            <img src="/images/${item.imagem}" alt="${item.nome}" />
            <div class="cart-item-info">
                <p class="cart-item-name">${item.nome}</p>
                <p class="cart-item-price">${item.quantidade} x ${formatCurrency(item.valor_unitario)}</p>
                <a href="#" class="btn btn-secondary remover-item" data-id="${item.id_produto}">Remover</a>
            </div>
        `;

        cartItemsEl.appendChild(div);
    });
}

/* --- Update totals and counts --- */
function updateTotalsAndCount(items) {
    const totalEl = qs(".cart-total strong");
    const countEl = qs(".cart-count");

    let total = 0;
    let totalItens = 0;

    (items || []).forEach((item) => {
        total += (parseFloat(item.valor_unitario) || 0) * (parseInt(item.quantidade, 10) || 0);
        totalItens += parseInt(item.quantidade, 10) || 0;
    });

    if (totalEl) totalEl.textContent = formatCurrency(total);
    if (countEl) countEl.textContent = totalItens > 0 ? totalItens : 0;
}

/* --- Atualizar carrinho (fetch server state and render) --- */
async function atualizarCarrinho() {
    try {
        const data = await fetchJSON("/carrinho/atual");
        if (!data || !data.success) return;

        renderCartItems(data.items);
        updateTotalsAndCount(data.items);
    } catch (err) {
        console.error("Erro ao atualizar carrinho:", err);
    }
}

/* --- Remove item (delegated) --- */
async function handleRemoveItemClick(target) {
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

/* --- Product list click delegation --- */
function initProductList() {
    const productList = qs("#productList");
    if (!productList) return;

    productList.addEventListener("click", (event) => {
        const target = event.target;

        if (target.classList.contains("btn-plus") || target.classList.contains("btn-minus")) {
            handleQuantityButtonClick(target);
            return;
        }

        if (target.classList.contains("add-to-cart-btn")) {
            const card = target.closest(".card");
            if (!card) return;

            const id_produto = target.dataset.productId;
            const quantidadeInput = qs(".quantity-input", card);
            const quantidade = quantidadeInput ? quantidadeInput.value : "1";

            addToCart(id_produto, quantidade);
        }
    });
}

/* --- Cart items delegation (remove) --- */
function initCartItemsListener() {
    const cartItems = qs(".cart-items");
    if (!cartItems) return;

    cartItems.addEventListener("click", async (e) => {
        const target = e.target;
        if (target.classList.contains("remover-item")) {
            e.preventDefault();
            await handleRemoveItemClick(target);
        }
    });
}

/* --- Initialize everything on DOM ready --- */
document.addEventListener("DOMContentLoaded", () => {
    initCartPopup();
    initProductList();
    initCartItemsListener();
    atualizarCarrinho();
});