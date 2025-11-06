import Express from "express";
import connection from "../models/db.js";

const router = Express.Router();

// ===== Rotas principais =====

router.get("/", (req, res) => {
	res.render("landing", {
		layout: false,
		title: "Bem-vindo à Loja de Café Gourmet",
		subtitle: "O melhor café direto para sua casa",
		callToAction: "Ver produtos",
		pageStyles: ["/css/card-form.css", "/css/landing.css"],
	});
});

router.get("/produtos", (req, res) => {
	const sql = `SELECT * FROM produtos`;

	connection.query(sql, (erro, retorno) => {
		res.render("produtos", {
			produtos: retorno,
			pageStyles: [
				"/css/card-form.css",
				"/css/hero-carousel.css",
				"/css/cart-popup.css",
			],
		});
	});
});

router.get("/produto/:id", (req, res) => {
	const id_produto = req.params.id;

	const sql = `SELECT * FROM produtos WHERE id_produto = ?`;

	connection.query(sql, [id_produto], (erro, retorno) => {
		if (erro) {
			console.error("Erro ao buscar produto por ID:", erro);
			return res.status(500).send("Erro interno do servidor.");
		}

		const produto = retorno[0];

		if (!produto) {
			return res.status(404).render("404", {
				message: "Produto não encontrado.",
				pageStyles: ["/css/card-form.css"],
			});
		}

		res.render("produto-detalhes", {
			produto: produto,
			pageStyles: ["/css/cart-popup.css", "/css/product-details.css"],
		});
	});
});

// ===== Rota de login/registro de usuário =====

router.get("/login", (req, res) => {
	res.render("login", {
		pageStyles: ["/css/login-form.css"],
	});
});

router.get("/cadastro", (req, res) => {
	res.render("cadastro", {
		pageStyles: ["/css/login-form.css"],
	});
});

export default router;
