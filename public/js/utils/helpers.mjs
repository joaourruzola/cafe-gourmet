export const qs = (sel, ctx = document) => ctx.querySelector(sel);
export const qsa = (sel, ctx = document) =>
	Array.from(ctx.querySelectorAll(sel));

export const fetchJSON = async (url, options = {}) => {
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

export const formatarMoeda = (value) =>
	`R$ ${parseFloat(value || 0).toFixed(2)}`;

export const alternarPopup = (popup) => popup.classList.toggle("active");
export const fecharPopup = (popup) => popup.classList.remove("active");

export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

/**
 * Exibe uma notificação Toast no canto da tela.
 * @param {string} message
 * @param {('success'|'error'|'warning')} type
 * @param {number} duration
 * @param {Event} event O evento de clique.
 */

export function showToast(message, type = "success", duration = 3000) {
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
