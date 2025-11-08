function isAdmin(req, res, next) {
	const userIsAdmin = req.user && req.user.tipo === "admin";

	if (userIsAdmin) {
		next();
	} else {
		if (
			req.headers["accept"] &&
			req.headers["accept"].includes("application/json")
		) {
			return res.status(403).json({
				status: "erro",
				mensagem: "Acesso negado. Ação exclusiva de administrador.",
			});
		}
		res.status(403).redirect("/produtos");
	}
}

export default isAdmin;
