// redeclarado função fetchJSON, provisório até corrigir importação
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
			event.preventDefault();

			const formData = new FormData(loginForm);
			const data = Object.fromEntries(formData.entries());

			try {
				const response = await fetchJSON("/auth/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				});

				// sucesso
				if (response.status === "sucesso" && response.redirect) {
					if (typeof showToast === "function") {
						showToast(
							response.mensagem || "Login bem-sucedido!",
							"success",
							2000
						);
					}

					setTimeout(() => {
						window.location.href = response.redirect;
					}, 150);
				} else {
					if (typeof showToast === "function") {
						showToast(
							"Resposta inesperada do servidor.",
							"error",
							5000
						);
					}
				}
			} catch (error) {
				const errorMessage =
					error.message || "Falha na conexão ou erro desconhecido.";

				if (typeof showToast === "function") {
					showToast(errorMessage, "error", 5000);
				} else {
					alert(errorMessage);
				}
			}
		});
	}
});
