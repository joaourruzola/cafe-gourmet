document.addEventListener("DOMContentLoaded", () => {
	const radios = document.querySelectorAll("input[name='payment']");
	const forms = document.querySelectorAll(".payment-form");

	// Função para atualizar a visibilidade dos formulários
	function updatePaymentView() {
		const selectedValue = document.querySelector(
			"input[name='payment']:checked"
		).value;
		const targetId = `${selectedValue}-form`;

		forms.forEach((form) => {
			form.classList.toggle("hidden", form.id !== targetId);
		});
	}

	radios.forEach((radio) => {
		radio.addEventListener("change", updatePaymentView);
	});
	updatePaymentView();

	// --- CORREÇÃO DO BUG 4 (INÍCIO) ---
	// Esta é a lógica de validação e envio que estava faltando
	const paymentForm = document.getElementById("payment-form");

	if (paymentForm) {
		paymentForm.addEventListener("submit", async (e) => {
			e.preventDefault(); // Impede o envio padrão do formulário

			const selectedMethod = document.querySelector(
				'input[name="payment"]:checked'
			).value;

			// Foco no pagamento com cartão, como solicitado
			if (selectedMethod === "cartao") {
				const numeroCartao = document.querySelector(
					'input[name="numero_cartao"]'
				).value;
				const validade = document.querySelector(
					'input[name="validade"]'
				).value;
				const cvv = document.querySelector('input[name="cvv"]').value;

				// Validação simples (apenas verifica se não está vazio)
				if (!numeroCartao || !validade || !cvv) {
					alert("Por favor, preencha todos os dados do cartão.");
					return; // Para a execução
				}

				// Envia para o backend (a rota que criamos em cart.mjs)
				try {
					const response = await fetch("/checkout/pagar", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							paymentMethod: "cartao",
							cardInfo: { numeroCartao, validade, cvv },
						}),
					});

					const data = await response.json();

					if (response.ok) {
						// Redireciona para a página de "aguardando"
						window.location.href = data.redirectUrl;
					} else {
						alert(`Erro ao processar pagamento: ${data.mensagem}`);
					}
				} catch (error) {
					console.error("Erro no fetch:", error);
					alert(
						"Não foi possível conectar ao servidor. Tente novamente."
					);
				}
			}

			// (Adicione lógica para PIX e Boleto aqui se necessário)
		});
	}
	// --- CORREÇÃO DO BUG 4 (FIM) ---

	const numeroCartaoInput = document.querySelector(
		'input[name="numero_cartao"]'
	);
	const validadeInput = document.querySelector('input[name="validade"]');
	const cvvInput = document.querySelector('input[name="cvv"]');

	// formatação do Número do Cartão (XXXX XXXX XXXX XXXX)
	if (numeroCartaoInput) {
		numeroCartaoInput.addEventListener("input", (e) => {
			let value = e.target.value;
			let digits = value.replace(/\D/g, "");

			digits = digits.substring(0, 16);

			let formatted = digits.match(/.{1,4}/g)?.join(" ") || "";
			e.target.value = formatted;
		});
	}

	// formatação da Validade (MM/AA)
	if (validadeInput) {
		validadeInput.addEventListener("input", (e) => {
			let value = e.target.value;
			let digits = value.replace(/\D/g, "");

			digits = digits.substring(0, 4);

			if (digits.length > 2) {
				digits = `${digits.substring(0, 2)}/${digits.substring(2)}`;
			}
			e.target.value = digits;
		});
	}

	// formatação do CVV (XXX)
	if (cvvInput) {
		cvvInput.addEventListener("input", (e) => {
			let value = e.target.value;
			// Remove tudo que não for dígito
			let digits = value.replace(/\D/g, "");
			digits = digits.substring(0, 3);
			e.target.value = digits;
		});
	}
});
const itensCarrinho = document.querySelector(".cart-summary");

if (itensCarrinho) {
	itensCarrinho.addEventListener("click", function (e) {
		e.preventDefault();
		const tituloResumo = this.querySelector("h4");
		const itemCollapseMobile = document.querySelector(
			".item-collapse-mobile"
		);

		if (tituloResumo && itemCollapseMobile) {
			itemCollapseMobile.classList.toggle("hidden-default");
		}
	});
}
