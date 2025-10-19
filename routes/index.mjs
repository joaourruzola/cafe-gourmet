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

router.get("/painel", (req, res) => {
	const sql = `SELECT * FROM produtos`;

	connection.query(sql, (erro, retorno) => {
		res.render("form", {
			produtos: retorno,
			pageStyles: ["/css/style.css"],
		});
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

router.get("/carrinho/atual", (req, res) => {
	const id_usuario = 1; // TEMP: replace with session later

	connection.query(
		`SELECT 
    carrinho_itens.id_item,
    carrinho_itens.id_produto,
    produtos.nome,
    produtos.imagem,
    carrinho_itens.quantidade,
    carrinho_itens.valor_unitario
    FROM carrinho_itens
    JOIN carrinhos ON carrinho_itens.id_carrinho = carrinhos.id_carrinho
    JOIN produtos ON carrinho_itens.id_produto = produtos.id_produto
    WHERE carrinhos.id_usuario = ? AND carrinhos.ativo = 1;
    `,
		[id_usuario],
		(err, results) => {
			if (err)
				return res.status(500).json({ success: false, error: err });
			res.json({ success: true, items: results });
			console.log(res.json);
		}
	);
});

// ===== Rota de login/registro de usuário =====

router.get("/login", (req, res) => {
	res.render("login", {
		pageStyles: ["/css/login-form.css"],
	});
});

// ===== Rotas POST =====

router.post("/carrinho/adicionar", (req, res) => {
	const { id_produto, quantidade } = req.body;
	const id_usuario = 1; // TEMP: replace with session user ID later

	if (!id_produto || !quantidade) {
		return res
			.status(400)
			.json({ success: false, message: "Dados inválidos" });
	}

	// Verifica se o usuário já tem carrinho ativo
	connection.query(
		"SELECT id_carrinho FROM carrinhos WHERE id_usuario = ? AND ativo = 1 LIMIT 1",
		[id_usuario],
		(err, results) => {
			if (err)
				return res.status(500).json({ success: false, error: err });

			let id_carrinho;

			if (results.length > 0) {
				id_carrinho = results[0].id_carrinho;
				adicionarItem();
			} else {
				// Cria novo carrinho
				connection.query(
					"INSERT INTO carrinhos (id_usuario, ativo) VALUES (?, 1)",
					[id_usuario],
					(err, insertRes) => {
						if (err)
							return res
								.status(500)
								.json({ success: false, error: err });
						id_carrinho = insertRes.insertId;
						adicionarItem();
					}
				);
			}

			function adicionarItem() {
				// Verifica se item já existe
				connection.query(
					"SELECT * FROM carrinho_itens WHERE id_carrinho = ? AND id_produto = ?",
					[id_carrinho, id_produto],
					(err, itemRes) => {
						if (err)
							return res
								.status(500)
								.json({ success: false, error: err });

						if (itemRes.length > 0) {
							// Atualiza quantidade
							connection.query(
								"UPDATE carrinho_itens SET quantidade = quantidade + ? WHERE id_carrinho = ? AND id_produto = ?",
								[quantidade, id_carrinho, id_produto],
								(err) => {
									if (err)
										return res.status(500).json({
											success: false,
											error: err,
										});
									res.json({
										success: true,
										message:
											"Quantidade atualizada no carrinho",
									});
								}
							);
						} else {
							// Insere novo item
							connection.query(
								"INSERT INTO carrinho_itens (id_carrinho, id_produto, quantidade, valor_unitario) VALUES (?, ?, ?, (SELECT valor FROM produtos WHERE id_produto = ?))",
								[
									id_carrinho,
									id_produto,
									quantidade,
									id_produto,
								],
								(err) => {
									if (err)
										return res.status(500).json({
											success: false,
											error: err,
										});
									res.json({
										success: true,
										message: "Item adicionado ao carrinho",
									});
								}
							);
						}
					}
				);
			}
		}
	);
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
			if (erro) {
				console.error("Erro no MySQL:", erro);
				return res.redirect("/registerFail");
			}

			const imagePath = path.join(
				__dirname,
				"../public/images",
				req.files.imagem.name
			);

			req.files.imagem.mv(imagePath, (err) => {
				if (err) {
					console.error("Erro ao mover imagem:", err);
					return res.redirect("/registerFail");
				}
				console.log("Imagem salva em:", imagePath);
				res.redirect(303, "/registerSuccess");
			});
		});
	} catch (error) {
		console.error("Erro inesperado:", error);
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

	res.redirect(303, "/painel");
});

router.get("/alterar-produtos/:id_produto", (req, res) => {
	let sql = `SELECT * FROM produtos WHERE id_produto = ${req.params.id_produto}`;

	connection.query(sql, (erro, retorno) => {
		if (erro) throw erro;

		res.render("alterar-produtos", {
			produto: retorno[0],
			pageStyles: ["/css/style.css"],
		});
	});
});

router.get("/checkout", async (req, res) => {
	const id_usuario = 1; // temporário

	try {
		connection.query(
			`SELECT 
                ci.id_produto, p.nome, p.imagem, ci.quantidade, ci.valor_unitario,
                (ci.quantidade * ci.valor_unitario) AS subtotal
             FROM carrinho_itens ci
             JOIN carrinhos c ON ci.id_carrinho = c.id_carrinho
             JOIN produtos p ON ci.id_produto = p.id_produto
             WHERE c.id_usuario = ? AND c.ativo = 1`,
			[id_usuario],
			async (err, items) => {
				if (err) {
					console.error(err);
					return res.status(500).send("Erro ao buscar carrinho");
				}

				let totalCalculado = 0;
				let totalFormatado = "0.00";

				if (items.length > 0) {
					totalCalculado = items.reduce(
						(sum, item) => sum + (parseFloat(item.subtotal) || 0),
						0
					);
					totalFormatado = totalCalculado.toFixed(2);
				}

				console.log("Total (Número):", totalCalculado);
				console.log("Total (String):", totalFormatado);

				const pixPayload = `00020126360014BR.GOV.BCB.PIX0114+558199999999520400005303986540${totalFormatado}5802BR5920Minha Loja Online6009SAO PAULO62070503***6304`;
				const qrCodeDataURL = await QRCode.toDataURL(pixPayload);

				res.render("checkout", {
					items,
					total: totalFormatado,
					qrCodeDataURL,
					vazio: items.length === 0,
					pageStyles: ["/css/style.css", "/css/checkout.css"],
				});
			}
		);
	} catch (error) {
		console.error(error);
		res.status(500).send("Erro interno no servidor");
	}
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

// ===== Rotas DELETE =====

router.delete("/carrinho/remover/:id_produto", (req, res) => {
	const { id_produto } = req.params;
	const id_usuario = 1; // TEMP — substitua depois pela sessão do usuário

	// Pega o carrinho ativo
	connection.query(
		"SELECT id_carrinho FROM carrinhos WHERE id_usuario = ? AND ativo = 1 LIMIT 1",
		[id_usuario],
		(err, results) => {
			if (err)
				return res.status(500).json({ success: false, error: err });

			if (results.length === 0)
				return res.status(400).json({
					success: false,
					message: "Carrinho não encontrado",
				});

			const id_carrinho = results[0].id_carrinho;

			// Remove o item específico
			connection.query(
				"DELETE FROM carrinho_itens WHERE id_carrinho = ? AND id_produto = ?",
				[id_carrinho, id_produto],
				(err, deleteRes) => {
					if (err)
						return res
							.status(500)
							.json({ success: false, error: err });

					if (deleteRes.affectedRows === 0)
						return res.json({
							success: false,
							message: "Item não encontrado no carrinho",
						});

					res.json({
						success: true,
						message: "Item removido do carrinho",
					});
				}
			);
		}
	);
});

export default router;
