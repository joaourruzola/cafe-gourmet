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

document.addEventListener("DOMContentLoaded", () => {
	const loginForm = document.getElementById("loginForm");

	if (loginForm) {
		loginForm.addEventListener("submit", async (event) => {
			event.preventDefault(); // Impede o envio padrão do formulário (o que causa o redirecionamento imediato)

			const formData = new FormData(loginForm);
			const data = Object.fromEntries(formData.entries());

			try {
				// fetchJSON está definida em cart.js ou outro script global
				const response = await fetchJSON("/auth/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				});

				// Sucesso (recebemos o JSON com o redirect)
				if (response.status === "sucesso" && response.redirect) {
					// 1. Opcional: Mostrar Toast de sucesso antes de redirecionar
					if (typeof showToast === "function") {
						showToast(
							response.mensagem || "Login bem-sucedido!",
							"success",
							2000
						);
					}

					// 2. Redirecionamento CLIENT-SIDE
					setTimeout(() => {
						window.location.href = response.redirect;
					}, 200); // Pequeno delay para o toast aparecer
				} else {
					// Caso o backend retorne 200, mas sem redirect por algum erro inesperado
					if (typeof showToast === "function") {
						showToast(
							"Resposta inesperada do servidor.",
							"error",
							5000
						);
					}
				}
			} catch (error) {
				// O fetchJSON está configurado para lançar um Error com a mensagem do JSON 401/400
				const errorMessage =
					error.message || "Falha na conexão ou erro desconhecido.";

				// Exibe o alerta com a mensagem do JSON 401/400
				if (typeof showToast === "function") {
					showToast(errorMessage, "error", 5000);
				} else {
					alert(errorMessage);
				}

				// Nenhuma ação de redirecionamento aqui, o usuário permanece na tela de login.
			}
		});
	}
});
