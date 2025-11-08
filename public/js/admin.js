function isAdmin(req, res, next) {
	// Lógica real: verifica req.session.user.role === 'admin'
	const userIsAdmin = true;

	if (userIsAdmin) {
		next();
	} else {
		// Redireciona para o login ou uma página de acesso negado
		res.status(403).redirect("/login");
	}
}

export default isAdmin;