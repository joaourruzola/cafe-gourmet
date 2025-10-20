import path from "path";
import Express from "express";
import connection from "../models/db.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import QRCode from "qrcode";


const router = Express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ===== Rotas principais =====

router.get("/", (req, res) => {
	res.render("landing", {
		layout: false,
		title: "Bem-vindo à Loja de Café Gourmet",
		subtitle: "O melhor café direto para sua casa",
		callToAction: "Ver produtos",
		pageStyles: ["/css/style.css", "/css/landing.css"],
	});
});

router.get("/produtos", (req, res) => {
	const sql = `SELECT * FROM produtos`;

	connection.query(sql, (erro, retorno) => {
		res.render("produtos", {
			produtos: retorno,
			pageStyles: [
				"/css/style.css",
				"/css/hero-carousel.css",
				"/css/cart-popup.css",
			],
		});
	});
});


// ===== Rota de login/registro de usuário =====

router.get("/login", (req, res) => {
	res.render("login", {
		pageStyles: ["/css/login-form.css"],
	});
});

export default router;
