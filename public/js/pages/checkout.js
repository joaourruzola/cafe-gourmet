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
});

const itensCarrinho = document.querySelector(".cart-summary");

itensCarrinho.addEventListener("click", function (e) {
	e.preventDefault();
	const tituloResumo = this.querySelector("h4");
	const itemCollapseMobile = document.querySelector(".item-collapse-mobile");

	if (tituloResumo) {
		itemCollapseMobile.classList.toggle("hidden-default");
	}
});
