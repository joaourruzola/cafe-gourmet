import path, { dirname } from "path";
import { fileURLToPath } from "url";
import Express from "express";
import connection from "../models/db.js";
import fs from "fs";
import isAdmin from "../public/js/admin.js";

const router = Express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function renderFormWithMessage(res, returnMessage) {
	const sql = `SELECT * FROM produtos`;
	connection.query(sql, (erro, retorno) => {
		if (erro) {
			console.error("Erro ao buscar produtos para o formulário:", erro);
			return res.status(500).send("Erro interno ao carregar formulário.");
		}
		res.render("form", {
			produtos: retorno,
			returnMessage: returnMessage,
			pageStyles: ["/css/card-form.css"],
		});
	});
}

router.get("/painel", isAdmin, (req, res) => {
	const sql = `SELECT * FROM produtos`;

	connection.query(sql, (erro, retorno) => {
		res.render("form", {
			produtos: retorno,
			pageStyles: ["/css/card-form.css"],
		});
	});
});

router.post("/register", (req, res) => {
	try {
		let nome = req.body.nome;
		let valor = req.body.valor;
		let imagem = req.files.imagem.name;
		let estoque = req.body.estoque;

		if (nome == "" || valor == "" || isNaN(valor)) {
			return res.redirect("/admin/registerFail");
		}

		let sql = `INSERT INTO produtos (nome, valor, imagem, estoque) VALUES ('${nome}', ${valor}, '${imagem}', ${estoque})`;

		connection.query(sql, (erro, retorno) => {
			if (erro) {
				console.error("Erro no MySQL:", erro);
				return res.redirect("/admin/registerFail");
			}

			const imagePath = path.join(
				__dirname,
				"../public/images",
				req.files.imagem.name
			);

			req.files.imagem.mv(imagePath, (err) => {
				if (err) {
					console.error("Erro ao mover imagem:", err);
					return res.redirect("/admin/registerFail");
				}
				console.log("Imagem salva em:", imagePath);
				res.redirect(303, "/admin/registerSuccess");
			});
		});
	} catch (error) {
		console.error("Erro inesperado:", error);
		res.redirect("/admin/registerFail");
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
		return res.redirect("/admin/editFail");
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

					return res.redirect(303, "/admin/editSuccess");
				});
			});
		});
	} catch (error) {
		return res.redirect(303, "/admin/editFail");
	}
});

// ===== Rotas GET (CRUD) =====

router.get("/alterar-produtos/:id_produto", (req, res) => {
	let sql = `SELECT * FROM produtos WHERE id_produto = ${req.params.id_produto}`;

	connection.query(sql, (erro, retorno) => {
		if (erro) throw erro;

		res.render("alterar-produtos", {
			produto: retorno[0],
			pageStyles: ["/css/card-form.css"],
		});
	});
});

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

	res.redirect(303, "/admin/painel");
});

// ===== ROTAS DE MENSAGEM EXPLÍCITAS (Substituem a rota dinâmica) =====

router.get("/registerSuccess", (req, res) => {
	renderFormWithMessage(res, "registerSuccess");
});

router.get("/registerFail", (req, res) => {
	renderFormWithMessage(res, "registerFail");
});

router.get("/editSuccess", (req, res) => {
	renderFormWithMessage(res, "editSuccess");
});

router.get("/editFail", (req, res) => {
	renderFormWithMessage(res, "editFail");
});

export default router;
