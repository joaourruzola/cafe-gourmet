import Express from "express";
import connection from "../models/db.js";
import QRCode from "qrcode";
import isAdmin from "../public/js/admin.js";

const router = Express.Router();

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

// ===== Rotas DELETE =====

router.delete("/carrinho/remover/:id_produto", isAdmin, (req, res) => {
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
