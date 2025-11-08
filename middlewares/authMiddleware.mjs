import jwt from "jsonwebtoken";
import connection from "../models/db.js";

const GUEST_USER_ID = 0;

const authMiddleware = (req, res, next) => {
	const authToken = req.cookies.auth_token;

	req.id_usuario = GUEST_USER_ID;
	req.user = null;
	res.locals.isAuthenticated = false;
	res.locals.userName = null;
	res.locals.isAdmin = false;

	if (!authToken) {
		return next();
	}

	try {
		const decoded = jwt.verify(authToken, process.env.JWT_SECRET);

		const sql = `SELECT id_usuario, nome, tipo_usuario FROM usuarios WHERE id_usuario = ?`;
		connection.query(sql, [decoded.id], (err, results) => {
			if (err || results.length === 0) {
				res.clearCookie("auth_token");
				return next();
			}

			const usuario = results[0];

			req.user = {
				id: usuario.id_usuario,
				nome: usuario.nome,
				tipo: usuario.tipo_usuario,
			};

			req.id_usuario = usuario.id_usuario;

			res.locals.isAuthenticated = true;
			res.locals.userName = usuario.nome
				? usuario.nome.split(" ")[0]
				: "Conta";
			res.locals.isAdmin = usuario.tipo_usuario === "admin";

			next();
		});
	} catch (err) {
		res.clearCookie("auth_token");
		next();
	}
};

export default authMiddleware;
