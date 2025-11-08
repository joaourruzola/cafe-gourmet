function isAdmin(req, res, next) {
	const userIsAdmin = req.user && req.user.tipo === "admin";

	if (userIsAdmin) {
		next();
	} else {
		res.status(403).redirect("/produtos");
	}
}

export default isAdmin;
