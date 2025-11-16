import Express from "express";
import connection from "../models/db.js";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Express.Router();

router.post("/login", async (req, res) => {
	try {
		const { email, senha } = req.body;

		if (!email || !senha) {
			return res.status(400).json({
				status: "erro",
				mensagem: "Por favor, preencha o email e a senha.",
			});
		}

		const sql = `SELECT * FROM usuarios WHERE email = ? LIMIT 1`;

		connection.query(sql, [email], async (erro, retorno) => {
			if (erro) {
				console.error("Erro ao buscar usuário:", erro);
				return res.status(500).json({
					status: "erro",
					codigo: 500,
					mensagem:
						"Erro ao buscar dados no servidor. Tente novamente.",
				});
			}

			const usuario = retorno[0];

			if (!usuario) {
				return res.status(401).json({
					status: "erro",
					codigo: 401,
					mensagem: "Email ou senha inválidos. Tente novamente.",
				});
			}

			const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

			if (!senhaCorreta) {
				return res.status(401).json({
					status: "erro",
					codigo: 401,
					mensagem: "Email ou senha inválidos. Tente novamente.",
				});
			}
			const authenticatedUserId = usuario.id_usuario;
			const anonymousCartId = req.cookies.guest_cart_id; // Pega o carrinho anônimo

			console.log(">>> ID do carrinho: ", req.cookies.guest_cart_id);

			// Função para finalizar o login
			const finalizeLogin = () => {
				// Usuário autenticado! Gerar um Token JWT
				const payload = {
					id: usuario.id_usuario,
					email: usuario.email,
					tipo: usuario.tipo_usuario,
				};

				const token = jwt.sign(payload, process.env.JWT_SECRET, {
					expiresIn: "1d",
				});

				res.cookie("auth_token", token, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					maxAge: 24 * 60 * 60 * 1000,
					sameSite: "strict",
				});
				// Limpar o cookie do carrinho anônimo
				res.clearCookie("guest_cart_id");

				const redirectPath =
					usuario.tipo_usuario === "admin"
						? "/admin/painel"
						: "/produtos";

				res.status(200).json({
					status: "sucesso",
					mensagem: "Login bem-sucedido!",
					redirect: redirectPath,
				});
			};

			// Se existe um carrinho anônimo (guest_cart_id), tente mesclá-lo
			if (anonymousCartId) {
				const mergeSql = `
                    UPDATE carrinhos 
                    SET id_usuario = ? 
                    WHERE id_carrinho = ? 
                    AND id_usuario = 0
                `;

				connection.query(
					mergeSql,
					[authenticatedUserId, anonymousCartId],
					(mergeErr, mergeResult) => {
						if (mergeErr) {
							console.error(
								"Erro ao tentar mesclar o carrinho anônimo:",
								mergeErr
							);
						} else if (mergeResult.affectedRows > 0) {
							console.log(
								`Carrinho anônimo [${anonymousCartId}] mesclado para o usuário [${authenticatedUserId}]`
							);
						}

						finalizeLogin();
					}
				);
			} else {
				finalizeLogin();
			}
		});
	} catch (error) {
		console.error("Erro síncrono no login:", error);
		res.status(500).json({
			status: "erro",
			codigo: 500,
			mensagem:
				"Não foi possível realizar o login devido a um erro interno. Tente mais tarde.",
			detalhe: error.message,
		});
	}
});

router.post("/cadastro", (req, res) => {
	try {
		const { nome, email, senha } = req.body;

		if (!nome || !email || !senha) {
			return res.status(400).json({
				status: "erro",
				codigo: 400,
				mensagem:
					"Todos os campos (Nome, Email e Senha) são obrigatórios.",
			});
		}

		// Checar se o usuário já existe
		const checkSql =
			"SELECT id_usuario FROM usuarios WHERE email = ? LIMIT 1";

		connection.query(checkSql, [email], async (err, results) => {
			if (err) {
				console.error("Erro ao checar usuário:", err);
				return res.status(500).json({
					status: "erro",
					codigo: 500,
					mensagem:
						"Erro ao verificar a disponibilidade do email. Tente novamente.",
				});
			}

			const existingUser = results;

			if (existingUser.length > 0) {
				return res.status(409).json({
					status: "erro",
					codigo: 409,
					mensagem:
						"Este email já está em uso. Tente outro ou faça login.",
				});
			}

			try {
				const salt = await bcrypt.genSalt(10);
				const senhaHash = await bcrypt.hash(senha, salt);

				const tipo_usuario = "cliente";
				const insertSql =
					"INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)";

				connection.query(
					insertSql,
					[nome, email, senhaHash, tipo_usuario],
					(insertErr, insertResult) => {
						if (insertErr) {
							console.error(
								"Erro ao inserir usuário:",
								insertErr
							);
							return res.status(500).json({
								status: "erro",
								codigo: 500,
								mensagem:
									"Não foi possível finalizar seu cadastro. Por favor, tente novamente.",
							});
						}

						res.redirect(303, "/produtos");
					}
				);
			} catch (hashError) {
				console.error("Erro no hasheamento:", hashError);
				res.status(500).json({
					status: "erro",
					codigo: 500,
					mensagem:
						"Ocorreu um erro de segurança interno durante o cadastro. Tente novamente.",
				});
			}
		});
	} catch (error) {
		console.error("Erro síncrono no cadastro:", error);
		res.status(500).json({
			status: "erro",
			codigo: 500,
			mensagem:
				"Ocorreu um erro interno no servidor durante o cadastro. Tente novamente.",
		});
	}
});

router.get("/logoff", (req, res) => {
	res.clearCookie("auth_token");
	res.clearCookie("guest_cart_id");
	res.redirect(303, "/produtos");
});

export default router;
