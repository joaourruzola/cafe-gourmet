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

document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll(".btn.btn-success").forEach((button) => {
		button.addEventListener("click", async (e) => {
			const card = e.target.closest(".card");
			const id_produto = card
				.querySelector("input[type='number']")
				.id.split("-")[1];
			const quantidade = card.querySelector("input[type='number']").value;

			try {
				const response = await fetch("/carrinho/adicionar", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ id_produto, quantidade }),
				});

				const data = await response.json();

				console.log(data);

				if (data.success) {
					await atualizarCarrinho();
					alert("✅ " + data.message);
				} else {
					alert("❌ Erro: " + (data.message || "Falha ao adicionar"));
				}
			} catch (err) {
				alert("⚠️ Erro de rede ou servidor");
				console.error(err);
			}
		});
	});
});

async function atualizarCarrinho() {
	try {
		const response = await fetch("/carrinho/atual");
		const data = await response.json();

		if (!data.success) return;

		const cartItemsEl = document.querySelector(".cart-items");

		cartItemsEl.innerHTML = "";
		let total = 0;

		data.items.forEach((item) => {
			total += item.valor_unitario * item.quantidade;

			const div = document.createElement("div");
			div.classList.add("cart-item");
			div.innerHTML = `
            <img src="/images/${item.imagem}" alt="${item.nome}" />
            <div class="cart-item-info">
                <p class="cart-item-name">${item.nome}</p>
                <p class="cart-item-price">
                    ${item.quantidade} x R$ ${parseFloat(
				item.valor_unitario
			).toFixed(2)}
                </p> <a href="#" class="btn btn-secondary remover-item" data-id="${
					item.id_produto
				}">Remover</a>
            </div>`;

			cartItemsEl.appendChild(div);
		});

		const totalEl = document.querySelector(".cart-total strong");
		if (totalEl) {
			totalEl.textContent = `R$ ${total.toFixed(2)}`;
		}
	} catch (err) {
		console.error("Erro ao atualizar carrinho:", err);
	}
}

document.querySelector(".cart-items").addEventListener("click", async (e) => {
	// verifica se clicou em um botão com a classe .remover-item
	if (e.target.classList.contains("remover-item")) {
		e.preventDefault();
		const id_produto = e.target.dataset.id;

		try {
			const response = await fetch(`/carrinho/remover/${id_produto}`, {
				method: "DELETE",
			});
			const result = await response.json();

			if (result.success) {
				atualizarCarrinho();
				alert("✅ " + result.message);
			} else {
				alert(result.message || "Erro ao remover item");
			}
		} catch (err) {
			console.error("Erro ao remover item:", err);
		}
	}
});

document.addEventListener("DOMContentLoaded", atualizarCarrinho);
