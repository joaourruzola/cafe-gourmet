function isAdmin(req, res, next) {
	// Lógica real: verifica req.session.user.role === 'admin'
	const userIsAdmin = req.user && req.user.tipo === "admin";

	if (userIsAdmin) {
		next();
	} else {
		// Redireciona para o login ou uma página de acesso negado
		res.status(403).redirect("/produtos");
	}
}

export default isAdmin;
