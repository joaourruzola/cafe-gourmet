function isAdmin(req, res, next) {
	// Lógica real: verifica req.session.user.role === 'admin'
	const userIsAdmin = true; // Substitua por sua lógica de verificação

	if (userIsAdmin) {
		next(); // Continua para a rota
	} else {
		// Redireciona para o login ou uma página de acesso negado
		res.status(403).redirect("/login");
	}
}

export default isAdmin;