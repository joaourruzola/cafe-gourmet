import Express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connection from "../models/db.js";

const router = Express.Router();

router.post("/login", async (req, res) => {
	try {
		const { email, senha } = req.body;

		// 1. Validar se os dados vieram
		if (!email || !senha) {
			return res
				.status(400)
				.json({ erro: "Email e senha são obrigatórios." });
		}

		// 2. Buscar o usuário no banco pelo email
		// Usamos 'LIMIT 1' por segurança e performance, embora 'email' seja UNIQUE
		const [rows] = await connection.query(
			"SELECT * FROM usuarios WHERE email = ? LIMIT 1",
			[email]
		);

		const usuario = rows[0];

		// 3. Verificar se o usuário existe
		if (!usuario) {
			// Nota de segurança: envie uma mensagem genérica
			return res.status(401).json({ erro: "Credenciais inválidas." });
		}

		// 4. Comparar a senha enviada com o hash salvo no banco
		const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

		if (!senhaCorreta) {
			// Mesma mensagem genérica para não informar ao atacante se o email ou a senha estão errados
			return res.status(401).json({ erro: "Credenciais inválidas." });
		}

		// 5. Usuário autenticado! Gerar um Token JWT
		// O token é o que mantém o usuário "logado" no frontend
		const payload = {
			id: usuario.id_usuario,
			email: usuario.email,
			tipo: usuario.tipo_usuario,
		};

		// Use uma chave secreta forte, salva no seu .env
		const token = jwt.sign(
			payload,
			process.env.JWT_SECRET,
			{ expiresIn: "1h" } // Token expira em 1 hora
		);

		// 6. Enviar a resposta de sucesso com o token
		res.status(200).json({
			mensagem: `Bem-vindo, ${usuario.nome}!`,
			token: token,
		});
	} catch (error) {
		console.error("Erro no login:", error);
		res.status(500).json({ erro: "Ocorreu um erro interno no servidor." });
	}
});

export default router;
