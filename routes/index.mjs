import path from "path";
import Express from "express";
import connection from "../models/db.js";
import { engine } from "express-handlebars";
import fileUpload from "express-fileupload";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const router = Express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ===== Rotas principais =====

router.get("/", (req, res) => {
	const sql = `SELECT * FROM produtos`;

	connection.query(sql, (erro, retorno) => {
		res.render("form", { produtos: retorno });
	});
});

router.get("/landing", (req, res) => {
	res.render("landing", {
		layout: false,
		title: "Bem-vindo à Loja de Café Gourmet",
		subtitle: "O melhor café direto para sua casa",
		callToAction: "Ver produtos",
	});
});

router.get("/produtos", (req, res) => {
	const sql = `SELECT * FROM produtos`;

	connection.query(sql, (erro, retorno) => {
		res.render("produtos", { produtos: retorno });
	});
});

// ===== Rota de login/registro de usuário =====

router.get("/login", (req, res) => {
	res.render("login");
});

// ===== Rotas POST =====

router.post("/carrinho/adicionar", async (req, res) => {
	const { id_produto, quantidade } = req.body;
	const id_usuario = req.session.userId; // suposição de sessão

	// Pegar ou criar carrinho ativo
	let carrinho = await db.query(
		"SELECT * FROM carrinhos WHERE id_usuario = ? AND ativo = 1",
		[id_usuario]
	);
	if (carrinho.length === 0) {
		const result = await db.query(
			"INSERT INTO carrinhos (id_usuario, ativo) VALUES (?, 1)",
			[id_usuario]
		);
		carrinho = { id_carrinho: result.insertId };
	} else {
		carrinho = carrinho[0];
	}

	// Inserir ou atualizar item
	const itemExistente = await db.query(
		"SELECT * FROM carrinho_itens WHERE id_carrinho = ? AND id_produto = ?",
		[carrinho.id_carrinho, id_produto]
	);
	if (itemExistente.length > 0) {
		await db.query(
			"UPDATE carrinho_itens SET quantidade = quantidade + ? WHERE id_item = ?",
			[quantidade, itemExistente[0].id_item]
		);
	} else {
		await db.query(
			"INSERT INTO carrinho_itens (id_carrinho, id_produto, quantidade) VALUES (?, ?, ?)",
			[carrinho.id_carrinho, id_produto, quantidade]
		);
	}

	res.json({ success: true });
});

router.post("/register", (req, res) => {
	try {
		let nome = req.body.nome;
		let valor = req.body.valor;
		let imagem = req.files.imagem.name;
		let estoque = req.body.estoque;

		if (nome == "" || valor == "" || isNaN(valor)) {
			return res.redirect("/registerFail");
		}

		let sql = `INSERT INTO produtos (nome, valor, imagem, estoque) VALUES ('${nome}', ${valor}, '${imagem}', ${estoque})`;

		connection.query(sql, (erro, retorno) => {
			if (erro) throw erro;

			req.files.imagem.mv(
				__dirname + "/public/images/" + req.files.imagem.name
			);
			console.log(retorno);
		});

		res.redirect(303, "/registerSuccess");
		return;
	} catch (error) {
		res.redirect("/registerFail");
	}
});

router.post("/edit", (req, res) => {
	let { nome, valor, id_produto, nomeImagem, estoque } = req.body;

	if (!req.files || !req.files.imagem) {
		return res.status(400).send("Imagem não enviada");
	}

	let estoqueNum = parseInt(estoque, 10);

	if (
		nome == "" ||
		valor == "" ||
		isNaN(valor) ||
		isNaN(estoqueNum) ||
		estoqueNum < 0
	) {
		return res.redirect("/editFail");
	}

	try {
		let imagem = req.files.imagem;
		let estoqueNum = parseInt(estoque, 10);

		let sql = `UPDATE produtos SET nome=?, valor=?, imagem=?, estoque=? WHERE id_produto = ?`;
		let values = [nome, valor, imagem.name, estoqueNum, id_produto];

		console.log("Valores para update:", values);

		connection.query(sql, values, (erro, retorno) => {
			if (erro) return res.status(500).send("Erro ao atualizar produto");

			let oldImagePath = path.join(__dirname, "images", nomeImagem);

			fs.unlink(oldImagePath, (err) => {
				if (err && err.code !== "ENOENT") {
					console.error("Erro ao remover imagem antiga: ", err);
				}

				let newImagePath = path.resolve(
					__dirname,
					"../public/images",
					imagem.name
				);
				imagem.mv(newImagePath, (err) => {
					if (err) {
						console.error("Erro ao salvar nova imagem: ", err);
						return res.status(500).send("Erro ao salvar imagem");
					}

					return res.redirect(303, "/editSuccess");
				});
			});
		});
	} catch (error) {
		return res.redirect(303, "/editFail");
	}
});

// ===== Rotas GET específicas =====

router.get("/remove/:id_produto&:imagem", (req, res) => {
	let sql = `DELETE FROM produtos WHERE id_produto = ${req.params.id_produto}`;

	connection.query(sql, (erro, retorno) => {
		if (erro) throw erro;

		fs.unlink(
			__dirname + "/public/images/" + req.params.imagem,
			(erroImgDelete) => {
				console.log("Imagem removida");
			}
		);
	});

	res.redirect(303, "/");
});

router.get("/edit-form/:id_produto", (req, res) => {
	let sql = `SELECT * FROM produtos WHERE id_produto = ${req.params.id_produto}`;

	connection.query(sql, (erro, retorno) => {
		if (erro) throw erro;

		res.render("edit-form", { produto: retorno[0] });
	});
});

// ===== Rota dinâmica catch-all =====

router.get("/:returnMessage", (req, res) => {
	const sql = `SELECT * FROM produtos`;

	connection.query(sql, (erro, retorno) => {
		res.render("form", {
			produtos: retorno,
			returnMessage: req.params.returnMessage,
		});
	});
});

export default router;
